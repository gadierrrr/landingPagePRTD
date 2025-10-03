import type { NextApiRequest, NextApiResponse } from 'next';
import { eventSchema } from '../../src/lib/forms';
import { checkRateLimit, getClientIp } from '../../src/lib/rateLimit';
import {
  readWeeklyEvents,
  addEvent as addEventJson,
  updateEvent as updateEventJson,
  deleteEvent as deleteEventJson,
  getCurrentWeekStart
} from '../../src/lib/eventsStore';
import { getWeeklyEvents, createEvent, updateEvent as updateEventDb, deleteEvent as deleteEventDb } from '../../src/lib/eventsRepo';
import { isSqliteEnabled } from '../../src/lib/dataSource';
import { verifyAdminCookie } from '../../src/lib/admin/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const ip = getClientIp(req);
  const rateCheck = await checkRateLimit(ip);

  if (!rateCheck.allowed) {
    return res.status(429).json({ error: 'Too many requests. Please try again later.' });
  }

  try {
    switch (req.method) {
      case 'GET':
        const { week } = req.query;

        if (week && typeof week === 'string') {
          // Get specific week
          const weeklyEvents = isSqliteEnabled() ? await getWeeklyEvents(week) : await readWeeklyEvents(week);
          return res.status(200).json(weeklyEvents);
        } else {
          // Get current week by default
          const currentWeek = await getCurrentWeekStart();
          const weeklyEvents = isSqliteEnabled() ? await getWeeklyEvents(currentWeek) : await readWeeklyEvents(currentWeek);
          return res.status(200).json(weeklyEvents);
        }

      case 'POST':
        const adminCookie = req.cookies.admin_auth;
        if (!verifyAdminCookie(adminCookie || '')) {
          return res.status(401).json({ error: 'Unauthorized' });
        }

        const { weekStart, event: eventData } = req.body;

        if (!weekStart || typeof weekStart !== 'string') {
          return res.status(400).json({ error: 'Week start date is required' });
        }

        const createValidation = eventSchema.omit({ id: true, slug: true }).safeParse(eventData);

        if (!createValidation.success) {
          return res.status(422).json({
            error: 'Validation failed',
            details: createValidation.error.flatten().fieldErrors
          });
        }

        const newEvent = isSqliteEnabled()
          ? await createEvent(weekStart, createValidation.data)
          : await addEventJson(weekStart, createValidation.data);

        // Trigger revalidation
        await triggerRevalidation(res, weekStart, newEvent.slug);

        return res.status(201).json(newEvent);

      case 'PUT':
        const updateAdminCookie = req.cookies.admin_auth;
        if (!verifyAdminCookie(updateAdminCookie || '')) {
          return res.status(401).json({ error: 'Unauthorized' });
        }

        const { weekStart: updateWeekStart, event: updateEventData } = req.body;
        const { id, ...updateData } = updateEventData;

        if (!updateWeekStart || typeof updateWeekStart !== 'string') {
          return res.status(400).json({ error: 'Week start date is required' });
        }

        if (!id || typeof id !== 'string') {
          return res.status(400).json({ error: 'Event ID is required' });
        }

        const updateValidation = eventSchema.omit({ id: true, slug: true }).partial().safeParse(updateData);

        if (!updateValidation.success) {
          return res.status(422).json({
            error: 'Validation failed',
            details: updateValidation.error.flatten().fieldErrors
          });
        }

        const updatedEvent = isSqliteEnabled()
          ? await updateEventDb(updateWeekStart, id, updateValidation.data)
          : await updateEventJson(updateWeekStart, id, updateValidation.data);

        if (!updatedEvent) {
          return res.status(404).json({ error: 'Event not found' });
        }

        // Trigger revalidation
        await triggerRevalidation(res, updateWeekStart, updatedEvent.slug);

        return res.status(200).json(updatedEvent);

      case 'DELETE':
        const deleteAdminCookie = req.cookies.admin_auth;
        if (!verifyAdminCookie(deleteAdminCookie || '')) {
          return res.status(401).json({ error: 'Unauthorized' });
        }

        const { weekStart: deleteWeekStart, id: deleteId } = req.body;

        if (!deleteWeekStart || typeof deleteWeekStart !== 'string') {
          return res.status(400).json({ error: 'Week start date is required' });
        }

        if (!deleteId || typeof deleteId !== 'string') {
          return res.status(400).json({ error: 'Event ID is required' });
        }

        const deleted = isSqliteEnabled()
          ? await deleteEventDb(deleteWeekStart, deleteId)
          : await deleteEventJson(deleteWeekStart, deleteId);

        if (!deleted) {
          return res.status(404).json({ error: 'Event not found' });
        }

        // Trigger revalidation
        await triggerRevalidation(res, deleteWeekStart);

        return res.status(200).json({ success: true });

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Events API error:', error instanceof Error ? error.message : 'Unknown error');
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function triggerRevalidation(res: NextApiResponse, weekStart: string, slug?: string): Promise<void> {
  try {
    // Revalidate main events page
    await res.revalidate('/events');
    
    // Revalidate specific week page
    await res.revalidate(`/events/week/${weekStart}`);
    
    // Revalidate event detail page if slug provided
    if (slug) {
      await res.revalidate(`/events/${slug}`);
    }
    
    console.log(`Revalidated events pages for week ${weekStart}${slug ? ` and event ${slug}` : ''}`);
  } catch (error) {
    // Log but don't fail the write operation
    console.error('Revalidation error:', error instanceof Error ? error.message : 'Unknown error');
  }
}