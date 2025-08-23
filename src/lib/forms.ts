import { z } from 'zod';

export const waitlistSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  interest: z.string().optional(),
  consent: z.literal(true, { errorMap: () => ({ message: 'Consent is required' }) }),
  // Honeypot field - should be empty
  website: z.string().optional()
});

export const partnerSchema = z.object({
  // Support both old and new field names for flexibility
  company: z.string().min(2, 'Business name must be at least 2 characters').optional(),
  businessName: z.string().min(2, 'Business name must be at least 2 characters').optional(),
  contact: z.string().min(2, 'Point of contact must be at least 2 characters').optional(),
  poc: z.string().min(2, 'Point of contact must be at least 2 characters').optional(),
  email: z.string().email('Please enter a valid email address').optional(),
  businessEmail: z.string().email('Please enter a valid business email address').optional(),
  category: z.string().min(2, 'Category must be at least 2 characters'),
  notes: z.string().optional(),
  consent: z.literal(true, { errorMap: () => ({ message: 'Consent is required' }) }),
  // Honeypot field - should be empty
  website: z.string().optional()
}).refine(data => data.company || data.businessName, {
  message: "Business name is required",
  path: ["company"]
}).refine(data => data.contact || data.poc, {
  message: "Point of contact is required", 
  path: ["contact"]
}).refine(data => data.email || data.businessEmail, {
  message: "Email is required",
  path: ["email"]
});

export const dealSchema = z.object({
  id: z.string().uuid().optional(), // Generated server-side for new deals
  slug: z.string().min(1, 'Slug is required').optional(), // Generated from title, immutable once set
  title: z.string().min(1, 'Title is required').max(80, 'Title must be 80 characters or less'),
  description: z.string().max(180, 'Description must be 180 characters or less'),
  amountLabel: z.string().min(1, 'Amount label is required').max(20, 'Amount label must be 20 characters or less'),
  location: z.string().min(1, 'Location is required').max(60, 'Location must be 60 characters or less'),
  image: z.string().startsWith('/images/', 'Image must start with /images/'),
  category: z.enum(['restaurant', 'activity', 'hotel', 'tour'], {
    errorMap: () => ({ message: 'Category must be restaurant, activity, hotel, or tour' })
  }),
  expiry: z.string().optional().refine((val) => !val || !isNaN(Date.parse(val)), {
    message: 'Expiry must be a valid ISO date string'
  }),
  partner: z.string().max(80, 'Partner must be 80 characters or less').optional(),
  // New fields for detail pages
  externalUrl: z.string().url('External URL must be a valid URL').optional(),
  gallery: z.array(z.string().startsWith('/images/', 'Gallery images must start with /images/')).optional(),
  fullDescription: z.string().optional(),
  highlights: z.array(z.string()).optional(),
  terms: z.string().optional(),
  expiresAt: z.string().optional().refine((val) => !val || !isNaN(Date.parse(val)), {
    message: 'Expires at must be a valid ISO date string'
  }),
  price: z.number().positive().optional(),
  originalPrice: z.number().positive().optional(),
  currency: z.enum(['USD', 'EUR', 'GBP']).optional().default('USD')
});

export type WaitlistData = z.infer<typeof waitlistSchema>;
export type PartnerData = z.infer<typeof partnerSchema>;
export type Deal = z.infer<typeof dealSchema>;