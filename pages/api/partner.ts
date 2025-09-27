import type { NextApiRequest, NextApiResponse } from 'next';
import { partnerSchema } from '../../src/lib/forms';
import { checkRateLimit, getClientIp } from '../../src/lib/rateLimit';
import { addPartnerEmail } from '../../src/lib/mailchimp';

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
    const validation = partnerSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(422).json({
        error: 'Validation failed',
        details: validation.error.flatten().fieldErrors
      });
    }
    
    const data = validation.data;
    
    // Map frontend field names to backend expected names
    const email = (data.businessEmail ?? data.email)?.toLowerCase().trim();
    const website = data.website;
    const company = data.businessName ?? data.company;
    
    if (!email) {
      return res.status(422).json({ error: 'Email is required' });
    }
    
    // Honeypot check
    if (website) {
      return res.status(204).end();
    }
    
    // Add email to MailChimp as partner
    await addPartnerEmail(email, company);
    
    res.status(200).json({ ok: true, message: "Successfully added as partner" });
  } catch (error) {
    console.error('Partner error:', error instanceof Error ? error.message : 'Unknown error');
    
    if (error instanceof Error && error.message === 'INVALID_EMAIL') {
      return res.status(422).json({ error: 'invalid_email' });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
}