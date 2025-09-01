import { promises as fs } from 'fs';
import { join } from 'path';
import crypto from 'crypto';
import { Event, WeeklyEvents, EventsIndex } from './forms';
import { generateEventSlug } from './slugGenerator';

const EVENTS_DIR = join(process.cwd(), 'data', 'events');
const INDEX_FILE = join(EVENTS_DIR, '_index.json');
const INDEX_FILE_TMP = join(EVENTS_DIR, '_index.json.tmp');

// Get Monday of the week for a given date
function getWeekStartDate(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday start
  const monday = new Date(d.setDate(diff));
  return monday.toISOString().split('T')[0]; // YYYY-MM-DD
}

// Export for testing
export { getWeekStartDate };

function getWeekFilePath(weekStart: string): string {
  return join(EVENTS_DIR, `${weekStart}.json`);
}

function getWeekTmpFilePath(weekStart: string): string {
  return join(EVENTS_DIR, `${weekStart}.json.tmp`);
}

export async function readWeeklyEvents(weekStart: string): Promise<WeeklyEvents> {
  const filePath = getWeekFilePath(weekStart);
  
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return {
        weekStartDate: weekStart,
        events: []
      };
    }
    throw error;
  }
}

export async function writeWeeklyEvents(weeklyEvents: WeeklyEvents): Promise<void> {
  const filePath = getWeekFilePath(weeklyEvents.weekStartDate);
  const tmpPath = getWeekTmpFilePath(weeklyEvents.weekStartDate);
  const data = JSON.stringify(weeklyEvents, null, 2);
  
  // Atomic write: write to temp file, then rename
  await fs.writeFile(tmpPath, data, 'utf8');
  await fs.rename(tmpPath, filePath);
}

export async function readEventsIndex(): Promise<EventsIndex> {
  try {
    const data = await fs.readFile(INDEX_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return { weeks: [] };
    }
    throw error;
  }
}

export async function writeEventsIndex(index: EventsIndex): Promise<void> {
  const data = JSON.stringify(index, null, 2);
  
  // Atomic write: write to temp file, then rename
  await fs.writeFile(INDEX_FILE_TMP, data, 'utf8');
  await fs.rename(INDEX_FILE_TMP, INDEX_FILE);
}

export async function addEvent(weekStart: string, event: Omit<Event, 'id' | 'slug'>): Promise<Event> {
  const weeklyEvents = await readWeeklyEvents(weekStart);
  const existingSlugs = weeklyEvents.events.map(e => e.slug).filter(Boolean) as string[];
  
  const newEvent: Event = {
    ...event,
    id: crypto.randomUUID(),
    slug: generateEventSlug(event.title, event.venueName, event.startDateTime, existingSlugs),
    lastVerifiedAt: new Date().toISOString()
  };
  
  weeklyEvents.events.push(newEvent);
  await writeWeeklyEvents(weeklyEvents);
  
  // Update index
  await updateEventsIndex(weekStart, weeklyEvents);
  
  return newEvent;
}

export async function updateEvent(weekStart: string, id: string, updates: Partial<Omit<Event, 'id' | 'slug'>>): Promise<Event | null> {
  const weeklyEvents = await readWeeklyEvents(weekStart);
  const index = weeklyEvents.events.findIndex(event => event.id === id);
  
  if (index === -1) {
    return null;
  }
  
  // Preserve the slug - it should never change once set
  const { slug: _unused, ...safeUpdates } = updates as Partial<Event>;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _unused; // Acknowledge the unused variable
  
  // Always update the lastVerifiedAt timestamp on edits
  weeklyEvents.events[index] = { 
    ...weeklyEvents.events[index], 
    ...safeUpdates, 
    lastVerifiedAt: new Date().toISOString() 
  };
  
  await writeWeeklyEvents(weeklyEvents);
  await updateEventsIndex(weekStart, weeklyEvents);
  
  return weeklyEvents.events[index];
}

export async function deleteEvent(weekStart: string, id: string): Promise<boolean> {
  const weeklyEvents = await readWeeklyEvents(weekStart);
  const initialLength = weeklyEvents.events.length;
  const filteredEvents = weeklyEvents.events.filter(event => event.id !== id);
  
  if (filteredEvents.length === initialLength) {
    return false;
  }
  
  weeklyEvents.events = filteredEvents;
  await writeWeeklyEvents(weeklyEvents);
  await updateEventsIndex(weekStart, weeklyEvents);
  
  return true;
}

export async function getEventBySlug(slug: string): Promise<{ event: Event; weekStart: string } | null> {
  const index = await readEventsIndex();
  
  for (const week of index.weeks) {
    const weeklyEvents = await readWeeklyEvents(week.startDate);
    const event = weeklyEvents.events.find(e => e.slug === slug);
    if (event) {
      return { event, weekStart: week.startDate };
    }
  }
  
  return null;
}

export async function getCurrentWeekStart(): Promise<string> {
  return getWeekStartDate(new Date());
}

async function updateEventsIndex(weekStart: string, weeklyEvents: WeeklyEvents): Promise<void> {
  const index = await readEventsIndex();
  const weekIndex = index.weeks.findIndex(w => w.startDate === weekStart);
  
  // Extract unique cities and genres from events
  const cities = [...new Set(weeklyEvents.events.map(e => e.city))];
  const genres = [...new Set(weeklyEvents.events.map(e => e.genre))];
  
  const weekMeta = {
    startDate: weekStart,
    eventCount: weeklyEvents.events.length,
    cities,
    genres,
    lastUpdated: new Date().toISOString()
  };
  
  if (weekIndex === -1) {
    index.weeks.push(weekMeta);
  } else {
    index.weeks[weekIndex] = { ...index.weeks[weekIndex], ...weekMeta };
  }
  
  // Sort weeks by date and calculate prev/next
  index.weeks.sort((a, b) => a.startDate.localeCompare(b.startDate));
  
  for (let i = 0; i < index.weeks.length; i++) {
    index.weeks[i].prev = i > 0 ? index.weeks[i - 1].startDate : undefined;
    index.weeks[i].next = i < index.weeks.length - 1 ? index.weeks[i + 1].startDate : undefined;
  }
  
  await writeEventsIndex(index);
}

// Check if an image is referenced by any event across all weeks
export async function isImageReferenced(imageUrl: string): Promise<boolean> {
  const index = await readEventsIndex();
  
  for (const week of index.weeks) {
    const weeklyEvents = await readWeeklyEvents(week.startDate);
    for (const event of weeklyEvents.events) {
      if (event.heroImage?.url === imageUrl) {
        return true;
      }
      if (event.gallery?.some(img => img.url === imageUrl)) {
        return true;
      }
    }
  }
  
  return false;
}