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
  image: z.string().refine((val) => val.startsWith('/images/') || val.startsWith('/api/serve-upload/'), {
    message: 'Image must start with /images/ or /api/serve-upload/'
  }),
  category: z.enum(['restaurant', 'activity', 'hotel', 'tour'], {
    errorMap: () => ({ message: 'Category must be restaurant, activity, hotel, or tour' })
  }),
  expiry: z.string().optional().refine((val) => !val || !isNaN(Date.parse(val)), {
    message: 'Expiry must be a valid ISO date string'
  }),
  partner: z.string().max(80, 'Partner must be 80 characters or less').optional(),
  // New fields for detail pages
  externalUrl: z.string().url('External URL must be a valid URL').optional(),
  gallery: z.array(z.string().refine((val) => val.startsWith('/images/') || val.startsWith('/api/serve-upload/'), {
    message: 'Gallery images must start with /images/ or /api/serve-upload/'
  })).optional(),
  fullDescription: z.string().optional(),
  highlights: z.array(z.string()).optional(),
  terms: z.string().optional(),
  expiresAt: z.string().optional().refine((val) => !val || !isNaN(Date.parse(val)), {
    message: 'Expires at must be a valid ISO date string'
  }),
  price: z.number().positive().optional(),
  originalPrice: z.number().positive().optional(),
  currency: z.enum(['USD', 'EUR', 'GBP']).optional().default('USD'),
  // Additional fields for enhanced functionality
  sourceName: z.string().optional(),
  updatedAt: z.string().optional().refine((val) => !val || !isNaN(Date.parse(val)), {
    message: 'Updated at must be a valid ISO date string'
  }),
  howTo: z.array(z.string()).optional(),
  objectPosition: z.string().optional()
});

// Events schemas
export const eventImageSchema = z.object({
  url: z.string().refine((val) => val.startsWith('/images/'), {
    message: 'Image URL must start with /images/'
  }),
  alt: z.string().min(1, 'Alt text is required')
});

export const eventSchema = z.object({
  id: z.string().uuid().optional(), // Generated server-side for new events
  slug: z.string().min(1, 'Slug is required').optional(), // Generated from title + venue + date
  title: z.string().min(1, 'Title is required').max(80, 'Title must be 80 characters or less'),
  descriptionShort: z.string().max(180, 'Description must be 180 characters or less'),
  startDateTime: z.string().datetime('Start date must be a valid ISO datetime'),
  endDateTime: z.string().datetime('End date must be a valid ISO datetime').optional(),
  timezone: z.string().default('America/Puerto_Rico'),
  city: z.enum(['San Juan', 'Bayamón', 'Ponce', 'Mayagüez', 'Caguas', 'Arecibo', 'Guaynabo'], {
    errorMap: () => ({ message: 'City must be one of the Puerto Rico cities' })
  }),
  venueName: z.string().max(100, 'Venue name must be 100 characters or less').optional(),
  address: z.string().max(200, 'Address must be 200 characters or less').optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  genre: z.enum(['music', 'food', 'art', 'sports', 'family', 'nightlife', 'culture'], {
    errorMap: () => ({ message: 'Genre must be one of the available types' })
  }),
  free: z.boolean().default(false),
  priceFrom: z.number().positive().optional(),
  ageRestriction: z.string().optional(),
  links: z.object({
    details: z.string().url('Details URL must be valid').optional(),
    tickets: z.string().url('Tickets URL must be valid').optional()
  }).optional(),
  canonicalUrl: z.string().url('Canonical URL must be valid').optional(),
  heroImage: eventImageSchema.optional(),
  gallery: z.array(eventImageSchema).optional(),
  status: z.enum(['scheduled', 'canceled', 'postponed', 'sold_out']).default('scheduled'),
  source: z.string().max(50, 'Source must be 50 characters or less'),
  lastVerifiedAt: z.string().datetime().optional(),
  sponsorPlacement: z.enum(['hero', 'featured']).optional()
});

export const weeklyEventsSchema = z.object({
  weekStartDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Week start date must be YYYY-MM-DD format'),
  events: z.array(eventSchema),
  sponsors: z.array(z.object({
    placement: z.enum(['hero', 'featured']),
    eventId: z.string().uuid()
  })).optional()
});

export const eventsIndexSchema = z.object({
  weeks: z.array(z.object({
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    eventCount: z.number().nonnegative(),
    cities: z.array(z.string()),
    genres: z.array(z.string()),
    lastUpdated: z.string().datetime(),
    prev: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    next: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()
  }))
});

export type WaitlistData = z.infer<typeof waitlistSchema>;
export type PartnerData = z.infer<typeof partnerSchema>;
export type Deal = z.infer<typeof dealSchema>;
export type Event = z.infer<typeof eventSchema>;
export type EventImage = z.infer<typeof eventImageSchema>;
export type WeeklyEvents = z.infer<typeof weeklyEventsSchema>;
export type EventsIndex = z.infer<typeof eventsIndexSchema>;