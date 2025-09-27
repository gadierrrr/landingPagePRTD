import type { NextApiRequest, NextApiResponse } from 'next';
import { waitlistSchema } from '../../src/lib/forms';
import { checkRateLimit, getClientIp } from '../../src/lib/rateLimit';
import { addEmailToWaitlist } from '../../src/lib/mailchimp';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const ip = getClientIp(req);
  const rateCheck = await checkRateLimit(ip);
  
  if (!rateCheck.allowed) {
    return res.status(429).json({ error: 'Too many requests. Please try again later.' });
  }
  
  try {
    const validation = waitlistSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(422).json({
        error: 'Validation failed',
        details: validation.error.flatten().fieldErrors
      });
    }
    
    const { website, email, fullName, interest } = validation.data;
    
    // Honeypot check
    if (website) {
      return res.status(204).end();
    }
    
    // Add email to MailChimp waitlist
    await addEmailToWaitlist(email, fullName, interest);
    
    res.status(200).json({ ok: true, message: "Successfully added to waitlist" });
  } catch (error) {
    console.error('Waitlist error:', error instanceof Error ? error.message : 'Unknown error');
    
    if (error instanceof Error) {
      if (error.message === 'INVALID_EMAIL' || error.message.includes('looks fake or invalid')) {
        return res.status(422).json({ error: 'Please enter a valid email address' });
      }
      if (error.message === 'Member Exists') {
        return res.status(200).json({ ok: true, message: "You're already subscribed!" });
      }
    }
    
    res.status(503).json({ error: 'Please try again later' });
  }
}