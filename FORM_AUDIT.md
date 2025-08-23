# Form Audit Report

## Files & Handlers Map

### Form Components
- **Location**: `pages/landing.tsx:93-139` (both forms in same component)
- **Waitlist Form**: Lines 93-114 (`<h4>Join the Waitlist</h4>` to `</div>`)
- **Partner Form**: Lines 117-138 (`<h4>Become a Partner</h4>` to `</div>`)

### Form Handlers
- **onJoin**: `pages/landing.tsx:12` - `const onJoin = (e) => { e.preventDefault(); setJoined(true); };`
- **onPartner**: `pages/landing.tsx:13` - `const onPartner = (e) => { e.preventDefault(); setPartnered(true); };`
- **State Management**: `pages/landing.tsx:9-10` - `useState` for `joined` and `partnered` flags

### Current API Routes
- **Only Route**: `pages/api/health.ts` - Returns `{ status: 'ok', timestamp: Date.now() }`
- **Missing**: No `/api/waitlist` or `/api/partner` endpoints exist

## Current Flow Diagram

```
User fills form → onSubmit → preventDefault() → setState(true) → Show success message
                                ↓
                           NO DATA SENT
                           NO PERSISTENCE
                           NO EMAIL SENT
```

## Missing Pieces / Environment Checklist

### ❌ Missing Infrastructure
- [ ] **API Endpoints**: No `/api/waitlist` or `/api/partner` routes
- [ ] **Data Validation**: No Zod/Yup schemas for input validation
- [ ] **Data Storage**: No database, file system, or external service integration
- [ ] **Email Service**: No mail provider integration (Resend, SendGrid, etc.)
- [ ] **Environment Variables**: No email/database credentials configured

### ❌ Security Gaps
- [ ] **Input Validation**: Raw form data, no sanitization
- [ ] **Rate Limiting**: No protection against form spam
- [ ] **Bot Protection**: No CAPTCHA or honeypot fields
- [ ] **CSRF Protection**: Default Next.js CSRF, but no explicit token validation
- [ ] **PII Handling**: No consent timestamp logging or privacy compliance

### ❌ Current Dependencies
- **Package.json**: No mail libraries (Resend, Nodemailer, etc.)
- **Environment**: `.env.example` shows no required variables
- **Router**: Pages Router (confirmed) - no server actions available

## Recommended Approach: Option B (Resend + Local JSON Storage)

### Why This Option?
- **Simplest to implement**: Single email provider + file-based storage
- **Lowest operational overhead**: No database setup required
- **Production-ready**: Resend is reliable and has generous free tier
- **Compliance-friendly**: Easy to implement GDPR data export/deletion

### Implementation Plan

#### 1. Dependencies (1 command)
```bash
npm install resend zod
```

#### 2. Environment Variables
```
RESEND_API_KEY=re_xxxxx (get from resend.com)
NOTIFICATION_EMAIL=admin@puertoricotraveldeals.com
```

#### 3. Data Schema (Zod)
```typescript
// src/lib/schemas.ts
const WaitlistSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  window: z.string(),
  consent: z.boolean().refine(val => val === true),
  timestamp: z.string().datetime()
});

const PartnerSchema = z.object({
  company: z.string().min(1),
  contact: z.string().min(1),
  email: z.string().email(),
  category: z.string(),
  notes: z.string().optional(),
  timestamp: z.string().datetime()
});
```

#### 4. API Endpoints to Add
- `pages/api/waitlist.ts` - POST handler for waitlist signups
- `pages/api/partner.ts` - POST handler for partner applications

#### 5. Storage Strategy
- **Format**: JSON files in `data/` directory (git-ignored)
- **Files**: `data/waitlist.json`, `data/partners.json`
- **Backup**: Daily automated backups to external storage

#### 6. Email Templates
- **Waitlist**: Welcome email + admin notification
- **Partner**: Application received + admin notification with details

### Step-by-Step Implementation

1. **Install dependencies** (`npm install resend zod`)
2. **Add environment variables** to `.env.local`
3. **Create data schemas** in `src/lib/schemas.ts`
4. **Build API endpoints** with validation + storage
5. **Update form handlers** to POST to API routes
6. **Add error handling** and loading states
7. **Test with real email** delivery
8. **Deploy with environment** variables configured

### Alternative Options Considered

#### Option A: SaaS Forms (Formspree/Netlify Forms)
- **Pros**: Zero code, instant setup
- **Cons**: Less control, monthly costs, vendor lock-in

#### Option C: Mailchimp Audiences
- **Pros**: Built-in email marketing features
- **Cons**: Complex API, overkill for simple lead capture

## Security Recommendations

1. **Add rate limiting** (5 submissions per IP per hour)
2. **Implement honeypot field** for bot detection
3. **Add input sanitization** beyond Zod validation
4. **Log consent timestamps** for GDPR compliance
5. **Consider hCaptcha** if spam becomes an issue

## Risk Assessment

- **Data Loss Risk**: Medium (file-based storage, needs backup strategy)
- **Security Risk**: Low (validated inputs, no database injection vectors)
- **Spam Risk**: Medium (no CAPTCHA initially, but rate limiting helps)
- **Compliance Risk**: Low (simple consent tracking, easy data export)