# PRTD - Puerto Rico Travel Deals

Full-featured travel deals platform with Groupon-style detail pages, built with Next.js 14, TypeScript, and Tailwind CSS.

🌐 **Live Site**: https://puertoricotraveldeals.com

## 🚀 Live Production URLs

- **Main Site**: https://puertoricotraveldeals.com/landing
- **Deals Grid**: https://puertoricotraveldeals.com/deals
- **Sample Deal**: https://puertoricotraveldeals.com/deal/beach-resort-weekend
- **Join Waitlist**: https://puertoricotraveldeals.com/join
- **Partner Application**: https://puertoricotraveldeals.com/partner
- **Admin Interface**: https://puertoricotraveldeals.com/dealsmanager
- **Style Guide**: https://puertoricotraveldeals.com/styleguide
- **Health Check**: https://puertoricotraveldeals.com/healthz
- **Blog**: https://puertoricotraveldeals.com/blog

## Quick Start

```bash
npm ci
npm run dev
```

Visit http://localhost:3000/landing for the main page, http://localhost:3000/deals for the public deals grid, or click any deal to see its detail page.

## Tests

Unit:
```bash
npm test
```

Visual & smoke:
```bash
npx playwright test --grep @smoke
```

## Production Build Smoke

```bash
npm run build
NODE_ENV=production npm start
```

## Deployment (Minimal)

1. Server prep (Ubuntu): install Node LTS & build tools.
2. Create deploy user & directory `/var/www/prtd`.
3. Copy project, run `npm ci && npm run build`.
4. Install systemd unit (see `deploy/systemd-prtd.service.example` -> `/etc/systemd/system/prtd.service`).
5. `sudo systemctl daemon-reload && sudo systemctl enable --now prtd`.
6. Place Nginx file (see `deploy/nginx-prtd.conf.example`) in `/etc/nginx/sites-available/prtd.conf` and symlink to sites-enabled.
7. Test `nginx -t` and reload.
8. (Optional) Acquire certs: `sudo certbot --nginx -d puertoricotraveldeals.com -d www.puertoricotraveldeals.com` then uncomment HTTPS redirect.

## Site Architecture

### Pages
- `/landing` - Main marketing landing page  
- `/join` - Waitlist signup form
- `/partner` - Partner application form
- `/deals` - **Public deals grid** (clickable cards linking to detail pages)
- `/deal/[slug]` - **Individual deal detail pages** (Groupon-style with hero images, highlights, external CTAs)
- `/deal/id/[id]` - **Legacy ID redirects** (301 redirects to slug-based URLs)
- `/blog` - **Blog listing page** (travel tips and insights with SSG)
- `/blog/[slug]` - **Individual blog posts** (markdown-based content with Article schema)
- `/dealsmanager` - **Admin interface** for managing deals (full CRUD with extended fields)
- `/styleguide` - Design system reference

### API Endpoints
- `GET /api/health` - Health check, returns `{ "status": "ok" }`
- `POST /api/waitlist` - Waitlist form submissions with validation
- `POST /api/partner` - Partner application submissions with validation  
- `GET /api/deals` - Retrieve all deals as JSON array
- `POST /api/deals` - Create new deal (with validation)
- `PUT /api/deals` - Update existing deal by ID
- `DELETE /api/deals` - Remove deal by ID
- `GET /api/blog` - Retrieve all blog posts metadata as JSON array (with caching headers)
- `POST /api/upload-image` - Image upload for dealsmanager (JPEG/PNG/WebP, 5MB max, same-origin only)
- `GET /api/serve-upload/[...path]` - Secure file serving for uploaded images with proper headers and caching

### Deals Management System
- **Storage**: JSON file at `data/deals.json` with atomic writes
- **Admin Interface**: `/dealsmanager` - Full CRUD with extended fields for detail pages
- **Public Grid**: `/deals` - Clickable cards linking to individual deal pages
- **Detail Pages**: `/deal/[slug]` - Rich Groupon-style pages with ISR (Incremental Static Regeneration)
- **SEO Optimized**: Clean URLs, meta tags, Open Graph, JSON-LD structured data
- **External CTAs**: "Get This Deal" buttons with UTM tracking for partner attribution
- **Data Flow**: Admin changes → JSON storage → ISR regeneration → Live updates
- **Validation**: Extended Zod schemas with comprehensive field validation
- **Rate Limiting**: All API endpoints protected by IP-based rate limiting

### Deal Structure
**Core Fields**: `id` (UUID), `slug` (URL-safe identifier), `title`, `description`, `amountLabel`, `location`, `image`, `category` (restaurant/activity/hotel/tour), `partner`

**Detail Page Fields**: `externalUrl` (partner booking link), `gallery` (array of images), `fullDescription`, `highlights` (bullet points), `terms` (T&C text), `expiresAt` (ISO date), `price`/`originalPrice`/`currency` (structured pricing)

**Automatic Features**: Slug generation with collision handling, expired deal detection, discount percentage calculation, UTM parameter injection

### Blog Management System
- **Storage**: Markdown files in `content/blog/` directory with frontmatter
- **Static Generation**: SSG (Static Site Generation) with ISR for optimal performance
- **Content Format**: Markdown with YAML frontmatter containing metadata
- **Processing**: gray-matter for frontmatter parsing, remark for Markdown-to-HTML conversion
- **SEO Optimized**: Individual meta tags, Article structured data, canonical URLs
- **Security**: HTML sanitization disabled (Markdown-only, no dangerous HTML allowed)
- **Caching**: In-memory memoization for performance, cache clearing in development

### Blog Post Structure
**Required Frontmatter**: `title`, `slug`, `publishDate` (ISO date), `author`, `excerpt`
**Optional Frontmatter**: `tags` (array of strings)
**Content**: Standard Markdown with automatic HTML conversion (no raw HTML allowed)
**Automatic Features**: Slug derivation from frontmatter or filename, date-based sorting, tag display

## Environment Variables

Copy `.env.example` to `.env.local` and configure:

### Required for MailChimp Integration
- `MAILCHIMP_API_KEY` - Your MailChimp API key
- `MAILCHIMP_SERVER_PREFIX` - Your MailChimp server prefix (e.g., 'us13')
- `MAILCHIMP_AUDIENCE_ID` - Your MailChimp audience/list ID

## Development Workflows

### Adding New Pages
Use the scaffolding system to maintain consistency:
```bash
npm run scaffold:page -- --name "PageName" --route "/route" --title "Page Title"
```

### Managing Blog Content

#### Creating Blog Posts
Create new markdown files in `content/blog/` with required frontmatter:
```markdown
---
title: "Your Post Title"
slug: "your-post-slug" 
publishDate: "2025-08-29T12:00:00Z"
author: "Author Name"
excerpt: "Brief description for listing page and SEO"
tags: ["travel-tips", "puerto-rico"]
---

Your markdown content here...

## Headings work
- Lists work
- **Bold text** works
- Links work: [example](https://example.com)

No raw HTML is allowed for security.
```

#### Blog Features
- **Auto-routing**: Files automatically become pages at `/blog/slug`
- **SSG Performance**: Static generation with ISR (3600s revalidation)
- **SEO Optimized**: Article structured data, meta tags, canonical URLs
- **Date Formatting**: Automatic date formatting (e.g., "Aug 29, 2025")
- **Tag Display**: Visual tag chips on listing and detail pages
- **Related Posts**: Automatic related posts section on detail pages
- **Responsive**: Mobile-optimized design matching site design system

#### Development Workflow
```bash
# Add new blog post
touch content/blog/2025-08-29-post-title.md
# Edit with frontmatter + content
# Build to generate static pages
npm run build
# Restart production service
sudo systemctl restart prtd
```

### Managing Deals

#### Admin Interface (`/dealsmanager`)
- **Full CRUD**: Create, read, update, delete deals with comprehensive form validation
- **Extended Fields**: All detail page fields including external URLs, highlights, terms, pricing
- **Real-time Updates**: Changes reflect immediately via ISR (Incremental Static Regeneration)
- **Slug Management**: Automatic slug generation, immutable once set to preserve SEO

#### Public Experience
- **Deals Grid** (`/deals`): Clickable cards with hover effects and category badges
- **Detail Pages** (`/deal/[slug]`): Rich hero sections, highlight lists, external CTAs
- **Mobile Responsive**: Optimized for all device sizes with touch-friendly interactions
- **SEO Optimized**: Individual meta tags, social sharing, structured data per deal

#### Content Management
- **Image Upload**: Built-in uploader in dealsmanager for JPG/PNG/WebP files (max 5MB)
- **Storage**: Uploaded files saved to `/public/images/uploads/YYYY/MM/` with safe filenames  
- **Manual Paths**: Direct path entry still supported - place in `/public/images/`, reference as `/images/filename.ext`
- **Gallery Support**: Multiple images per deal for detail pages
- **Partner Links**: External URLs with automatic UTM parameter injection
- **Expiry Handling**: Visual indicators for expired deals, disabled CTAs

### Code Quality
Always run before committing:
```bash
npx tsc --noEmit        # Type checking
npm run lint            # ESLint (auto-fixes Tailwind class order)
npm run stylelint       # CSS validation  
npm test                # Unit tests
```

## File Organization

```
pages/                    # Next.js pages (routing)
├── api/                 # API endpoints (/api/*)
│   └── blog.ts         # Blog posts API endpoint
├── blog/               # Blog routes
│   └── [slug].tsx      # Individual blog post pages (SSG enabled)
├── deal/
│   ├── [slug].tsx      # Individual deal detail pages (ISR enabled)
│   └── id/[id].tsx     # Legacy ID-to-slug redirects
├── blog.tsx            # Blog listing page (SSG enabled)
├── landing.tsx          # Main marketing page
├── deals.tsx            # Public deals grid (clickable cards)
├── dealsmanager.tsx     # Admin deals management
├── join.tsx            # Waitlist signup form
└── partner.tsx         # Partner application form

src/
├── lib/                # Utilities & schemas
│   ├── blog.ts        # Blog post utilities (getAllPostsMeta, getPostBySlug)
│   ├── forms.ts       # Extended Zod validation schemas
│   ├── dealsStore.ts  # JSON operations with slug utilities
│   └── slugGenerator.ts # Slug creation with collision handling
├── styles/            # Global styles & design tokens
└── ui/                # React components
    ├── deals/         # Deal-specific components
    │   ├── DealCard.tsx      # Admin card component
    │   ├── DealForm.tsx      # Extended admin form
    │   ├── PublicDealCard.tsx # Clickable public cards
    │   └── DealsGrid.tsx     # Responsive grid layouts
    ├── layout/        # Layout components
    └── SEO.tsx        # SEO meta tags component

content/
└── blog/              # Blog posts (Markdown files with frontmatter)
    └── *.md           # Individual blog post files

data/
└── deals.json         # Extended deal storage (JSON)
```

## Feature Flags

### Prelaunch Mode
- **Location**: `pages/landing.tsx` - `PRELAUNCH` constant  
- **Purpose**: Hide sections during prelaunch phase for focused email collection
- **Hidden when enabled**: Travelers card, Businesses card, Our Partners section
- **Toggle**: Change `const PRELAUNCH = true;` to `false` to restore all sections

## Email Capture System

### Landing Page Email Forms
- **Mid-page CTA**: "Get Puerto Rico travel deals in your inbox" with inline email form
- **Footer form**: Newsletter signup integrated with MailChimp
- **Both forms submit to**: `POST /api/waitlist` with MailChimp integration
- **Features**: Client-side validation, honeypot protection, ARIA accessibility, loading states
- **Analytics**: Optional dataLayer events for successful submissions

### Form Security & UX
- **Spam protection**: Hidden honeypot fields (`company` field)
- **Rate limiting**: Inherited from existing `/api/waitlist` endpoint  
- **Accessibility**: ARIA labels, live regions for status messages
- **Responsive design**: Mobile-optimized with existing design tokens

## Changelog

**2025-08-29** - **📝 File-Based Markdown Blog System: Content Management & SEO**
  - **Blog Infrastructure**: Complete SSG-powered blog at `/blog` with individual post pages at `/blog/[slug]`
  - **Markdown Processing**: gray-matter for frontmatter parsing, remark for secure Markdown-to-HTML conversion
  - **Content Structure**: Frontmatter-based metadata (title, slug, publishDate, author, excerpt, tags) with automatic slug derivation
  - **Performance Optimized**: SSG with ISR (3600s revalidation), in-memory caching with development cache clearing
  - **SEO Excellence**: Article structured data, canonical URLs, meta tags, social sharing optimization
  - **Security First**: HTML sanitization disabled (Markdown-only), no dangerous HTML allowed for XSS protection  
  - **API Endpoint**: `/api/blog` provides JSON metadata with rate limiting and caching headers
  - **Design Integration**: Matches existing design system with responsive layouts and brand tokens
  - **Content Directory**: `content/blog/*.md` structure for easy content management and version control
  - **Production Ready**: Automatic route generation, systemd service restart workflow, zero-downtime deployments

**2025-08-25** - **📋 Partners Page Simplification: Google Form Integration**
  - **Feature flag system**: `PARTNERS_SIMPLIFIED` mode to streamline partner application process
  - **Google Form embed**: Replaced custom partner form with responsive Google Form at `/partner#apply`
  - **Simplified UX**: Hidden hero, why-partner, and how-it-works sections (reversible via feature flag)
  - **Enhanced accessibility**: Proper iframe title, fallback link for form access issues
  - **Design consistency**: Used existing brand tokens (sand/white) with mobile-optimized spacing
  - **Deep linking**: Added `#apply` anchor for direct form navigation

**2025-08-25** - **🎯 Prelaunch Mode: Email Collection Focus**
  - **Feature flag system**: `PRELAUNCH` mode to hide/show sections reversibly
  - **Email capture forms**: Mid-page banner and footer both integrated with MailChimp
  - **Enhanced UX**: Client-side validation, honeypot protection, loading states
  - **Accessibility**: ARIA live regions, proper labeling, keyboard navigation
  - **Analytics ready**: Optional dataLayer integration for form submissions
  - **Security**: Maintained existing rate limiting and form validation

**2025-08-24** - **📁 Image Upload System: Secure File Management for Dealsmanager**
  - **Admin Image Upload**: Built-in file picker in dealsmanager with drag-and-drop support
  - **Security First**: Same-origin validation, CSRF protection, file type verification, filename sanitization
  - **Smart Storage**: Organized uploads in `/public/images/uploads/YYYY/MM/` with timestamped filenames
  - **Format Support**: JPEG, PNG, WebP images up to 5MB with client/server validation
  - **Backward Compatible**: Existing manual path entry unchanged, both methods work seamlessly
  - **Live Preview**: 16:9 thumbnail preview with Next.js Image optimization
  - **Error Handling**: User-friendly validation messages for file type, size, and upload errors
  - **Testing**: 12 unit tests for upload helpers plus E2E Playwright tests for full workflow
  - **API Security**: Formidable-based `/api/upload-image` endpoint with comprehensive security checks

**2025-08-24** - **🚀 MVP Enhancement: Enhanced User Experience & Content Management**
  - **Landing Page Refresh**: Updated hero copy to "Puerto Rico travel deals, updated daily" with new proof row and affiliate disclosure
  - **Advanced Deals Filtering**: Added category chips and sort options (Newest/Ending Soon) with responsive toolbar
  - **Enhanced Deal Cards**: 16:9 aspect ratio images, source badges, expiry indicators, and improved meta display
  - **Rich Deal Detail Pages**: Structured sections ("Why we like it", "What to know", "How to redeem") with native sharing
  - **Smart UTM Tracking**: Runtime UTM parameter injection for accurate partner attribution
  - **Source Attribution**: Automatic source name derivation from external URLs (Groupon, Viator, etc.)
  - **SEO Improvements**: Enhanced page titles, descriptions, sitemap.xml generation, and expired page noindex
  - **Data Migration**: Added `updatedAt`, `sourceName`, and `howTo[]` fields with backward compatibility
  - **Comprehensive Testing**: 19 unit tests for utilities plus Playwright visual/e2e tests

**2025-08-23** - **🎉 Major Feature: Clickable Deals with Detail Pages**
  - Implemented Groupon-style individual deal pages at `/deal/[slug]` with ISR
  - Made all deal cards clickable with proper Link navigation
  - Extended Deal schema with slug, externalUrl, gallery, fullDescription, highlights, terms, pricing
  - Added slug generation utility with collision handling and immutability
  - Created backward-compatible ID→slug redirects at `/deal/id/[id]`
  - Enhanced dealsmanager with comprehensive new fields for detail page content
  - Added SEO optimization: meta tags, Open Graph, Twitter Cards, JSON-LD structured data
  - Implemented external link tracking with UTM parameters for partner attribution
  - Added expired deal handling with visual indicators and disabled CTAs
  - Comprehensive test coverage for slug generation and detail page rendering

**2025-08-21** - Added deals management system with public/admin split. Public deals display at `/deals`, admin interface at `/dealsmanager`. JSON-based storage with full CRUD operations.

**2025-08-24** - MailChimp integration restored. Form submissions to `/api/waitlist` and `/api/partner` now automatically add emails to MailChimp audience with appropriate tags ('waitlist' and 'partner').

**2025-08-20** - Mailchimp integration removed. Form submissions to `/api/waitlist` and `/api/partner` now return success responses without external API calls.

## Technical Stack

- **Frontend**: React 18 with TypeScript, Next.js 14 Pages Router
- **Styling**: Tailwind CSS with custom design tokens (`src/styles/tokens.css`)
- **Validation**: Zod schemas for form and API validation
- **Testing**: Jest + React Testing Library (unit), Playwright (visual/e2e)
- **Storage**: JSON file-based persistence with atomic writes (no external database)
- **Content Management**: Markdown files with frontmatter (gray-matter + remark processing)
- **File Upload**: Formidable for multipart form handling with security validation
- **Static Generation**: ISR for deals, SSG for blog posts (3600s revalidation)
- **SEO**: Meta tags, Open Graph, Twitter Cards, JSON-LD structured data (deals + articles)
- **Performance**: Image optimization, static generation, efficient routing, in-memory caching
- **Deployment**: Systemd service + Nginx reverse proxy with HTTPS

## Design System

**Tokens**: `src/styles/tokens.css` - Brand colors, spacing, typography  
**Components**: `src/ui/*` - Reusable React primitives (Button, Section, Heading, etc.)  
**Styleguide**: `/styleguide` - Visual reference for all design tokens and components

### Brand Colors
- **Navy**: `#0B2B54` (primary text, headers)
- **Blue**: `#0050A4` (CTAs, accents) 
- **Red**: `#ED1C24` (highlights, categories)
- **Sand**: `#FFF7EA` (backgrounds, warm neutrals)

## Updating

Pull changes & deploy to production:
```bash
git pull origin main    # Pull latest changes
npm ci                 # Clean install dependencies
npm run build          # Production build with ISR
sudo systemctl restart prtd  # Restart service
```

**Deployment Status**: ✅ Live on https://puertoricotraveldeals.com with HTTPS/SSL

**Recent Deployment**: 2025-08-24 - MVP Enhancement with advanced filtering, sharing, and UX improvements

## Troubleshooting

### Common Issues
- **Deals not loading**: Check file permissions on `data/deals.json` and directory
- **API errors**: Review rate limiting (429 responses) or validation failures (422)
- **Build failures**: Run `npx tsc --noEmit` to check TypeScript errors
- **Style issues**: Ensure design tokens are used (no raw hex colors allowed by ESLint)

### Debug Commands
```bash
# Check service status
sudo systemctl status prtd

# View logs
journalctl -u prtd -f

# Test API health
curl http://localhost:4000/api/health

# Check deals data with new fields
curl http://localhost:4000/api/deals

# Test deal detail page
curl http://localhost:4000/deal/beach-resort-weekend

# Test legacy ID redirect
curl -I http://localhost:4000/deal/id/550e8400-e29b-41d4-a716-446655440001

# Test blog routes
curl http://localhost:4000/blog
curl http://localhost:4000/blog/welcome-to-prtd-blog

# Check blog API
curl http://localhost:4000/api/blog
```

## Key Features

### 🎯 Deal Detail Pages
- **Hero Sections**: Large images, titles, pricing, and prominent CTAs
- **Rich Content**: Structured sections for highlights, terms, and redemption steps
- **External Links**: "Get This Deal" buttons with runtime UTM parameter injection
- **Native Sharing**: Web Share API with graceful fallbacks (WhatsApp, Facebook, Copy Link)
- **Source Attribution**: Automatic display of deal sources (Groupon, Viator, etc.)
- **SEO Optimized**: Individual page titles, descriptions, structured data
- **Mobile Responsive**: Touch-friendly design optimized for all screen sizes

### 🔍 Advanced Filtering & Search
- **Category Filters**: Dynamic chips for restaurant, hotel, tour, activity categories
- **Smart Sorting**: Newest (by updatedAt) and Ending Soon (by expiry) with stable ordering
- **Real-time Updates**: Instant filtering and sorting without page reloads
- **Responsive Design**: Mobile-friendly toolbar with optimized layouts

### 🎨 Enhanced Visual Design
- **16:9 Aspect Ratio Cards**: Consistent image sizing across all deal cards
- **Source Badges**: Dynamic "From: Groupon" style overlays on deal images
- **Expiry Indicators**: Clear visual cues for expired deals with disabled CTAs
- **Loading States**: Skeleton animations for better perceived performance
- **Improved Typography**: Better title truncation and meta information display

### 🔗 Smart Navigation & SEO
- **Clickable Cards**: All deal cards link to their detail pages
- **SEO-Friendly URLs**: Clean `/deal/beach-resort-weekend` style URLs
- **Legacy Support**: Old ID-based URLs automatically redirect (301)
- **Sitemap Generation**: Dynamic XML sitemap including all deals and pages
- **Expired Page Handling**: Automatic noindex for expired deals

### 🛠️ Enhanced Admin & Data Management
- **Extended Schema**: New fields for sourceName, updatedAt, and howTo instructions
- **Automatic Timestamps**: updatedAt field maintained on all deal modifications
- **Real-time Updates**: ISR ensures changes appear immediately
- **Data Migration**: Non-destructive migration system for schema updates
- **Partner Integration**: External URL fields with UTM tracking

### ⚡ Performance & SEO
- **ISR (Incremental Static Regeneration)**: Fast loading with live updates
- **JSON-LD Structured Data**: Rich search engine understanding (only when price data available)
- **Image Optimization**: Next.js Image component with lazy loading
- **Static Generation**: Pre-rendered pages for optimal performance
- **Smart Caching**: Efficient data loading and client-side state management

### 📁 Image Upload System
- **Admin Upload**: Built-in file picker in dealsmanager deal form
- **Supported Formats**: JPEG, PNG, WebP images (max 5MB per file)
- **Secure Storage**: Files saved to `/public/images/uploads/YYYY/MM/` with sanitized filenames
- **Filename Safety**: Automatic sanitization removes unsafe characters, adds timestamps
- **Security Features**: Same-origin validation, CSRF headers, file type verification
- **Backward Compatible**: Existing manual path entry still works alongside uploader
- **Live Preview**: 16:9 aspect ratio thumbnail preview after upload
- **Error Handling**: Client and server-side validation with user-friendly messages
- **API Endpoint**: `POST /api/upload-image` with formidable multipart parsing
- **Note**: Images are immediately accessible after upload and deal save in production

## Documentation

- **System Overview**: `DEALS_SYSTEM.md` - Complete deals management documentation
- **Development Guide**: `CLAUDE.md` - Development setup and patterns for Claude Code
- **Form Audit**: `FORM_AUDIT.md` - Form integration and validation details

## License

Internal project.
# landingPagePRTD
