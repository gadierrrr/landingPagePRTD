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

## Environment Variables

Copy `.env.example` to `.env.local`. None required yet.

## Development Workflows

### Adding New Pages
Use the scaffolding system to maintain consistency:
```bash
npm run scaffold:page -- --name "PageName" --route "/route" --title "Page Title"
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
- **Images**: Place in `/public/images/`, reference as `/images/filename.ext`
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
├── deal/
│   ├── [slug].tsx      # Individual deal detail pages (ISR enabled)
│   └── id/[id].tsx     # Legacy ID-to-slug redirects
├── landing.tsx          # Main marketing page
├── deals.tsx            # Public deals grid (clickable cards)
├── dealsmanager.tsx     # Admin deals management
├── join.tsx            # Waitlist signup form
└── partner.tsx         # Partner application form

src/
├── lib/                # Utilities & schemas
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

data/
└── deals.json         # Extended deal storage (JSON)
```

## Changelog

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

**2025-08-20** - Mailchimp integration removed. Form submissions to `/api/waitlist` and `/api/partner` now return success responses without external API calls.

## Technical Stack

- **Frontend**: React 18 with TypeScript, Next.js 14 Pages Router
- **Styling**: Tailwind CSS with custom design tokens (`src/styles/tokens.css`)
- **Validation**: Zod schemas for form and API validation
- **Testing**: Jest + React Testing Library (unit), Playwright (visual/e2e)
- **Storage**: JSON file-based persistence with atomic writes (no external database)
- **Static Generation**: ISR (Incremental Static Regeneration) for deal detail pages
- **SEO**: Meta tags, Open Graph, Twitter Cards, JSON-LD structured data
- **Performance**: Image optimization, static generation, efficient routing
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

**Recent Deployment**: 2025-08-23 - Clickable deals with Groupon-style detail pages

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
```

## Key Features

### 🎯 Deal Detail Pages
- **Hero Sections**: Large images, titles, pricing, and prominent CTAs
- **Rich Content**: Full descriptions, highlight bullets, terms & conditions
- **External Links**: "Get This Deal" buttons linking to partner booking sites
- **Social Sharing**: Open Graph and Twitter Card meta tags for rich sharing
- **SEO Optimized**: Individual page titles, descriptions, structured data
- **Mobile Responsive**: Touch-friendly design optimized for all screen sizes

### 🔗 Smart Navigation
- **Clickable Cards**: All deal cards link to their detail pages
- **SEO-Friendly URLs**: Clean `/deal/beach-resort-weekend` style URLs
- **Legacy Support**: Old ID-based URLs automatically redirect (301)
- **Breadcrumbs**: Clear navigation hierarchy on detail pages

### 🛠️ Enhanced Admin
- **Extended Forms**: All detail page fields in the admin interface
- **Real-time Updates**: ISR ensures changes appear immediately
- **Image Management**: Support for hero images and galleries
- **Partner Integration**: External URL fields with UTM tracking
- **Expiry Management**: Visual expired deal handling

### ⚡ Performance & SEO
- **ISR (Incremental Static Regeneration)**: Fast loading with live updates
- **JSON-LD Structured Data**: Rich search engine understanding
- **Image Optimization**: Next.js Image component with lazy loading
- **Static Generation**: Pre-rendered pages for optimal performance

## Documentation

- **System Overview**: `DEALS_SYSTEM.md` - Complete deals management documentation
- **Development Guide**: `CLAUDE.md` - Development setup and patterns for Claude Code
- **Form Audit**: `FORM_AUDIT.md` - Form integration and validation details

## License

Internal project.
# landingPagePRTD
