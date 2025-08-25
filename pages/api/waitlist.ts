import type { NextApiRequest, NextApiResponse } from 'next';
import { waitlistSchema } from '../../src/lib/forms';
import { checkRateLimit, getClientIp } from '../../src/lib/rateLimit';
import { addEmailToWaitlist } from '../../src/lib/mailchimp';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const ip = getClientIp(req);
  const rateCheck = checkRateLimit(ip);
  
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
    
    const { website, email, fullName } = validation.data;
    
    // Honeypot check
    if (website) {
      return res.status(204).end();
    }
    
    // Add email to MailChimp waitlist
    await addEmailToWaitlist(email, fullName);
    
    res.status(200).json({ ok: true, message: "Successfully added to waitlist" });
  } catch (error) {
    console.error('Waitlist error:', error instanceof Error ? error.message : 'Unknown error');
    
    if (error instanceof Error && error.message === 'INVALID_EMAIL') {
      return res.status(422).json({ error: 'invalid_email' });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
}