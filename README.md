# PRTD - Puerto Rico Travel Deals

Marketing landing page and deals management system built with Next.js 14, TypeScript, and Tailwind CSS.

## Quick Start

```bash
npm ci
npm run dev
```

Visit http://localhost:3000/landing for the main page or http://localhost:3000/deals for the public deals view.

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
- `/deals` - **Public deals display** (read-only grid of current travel deals)
- `/dealsmanager` - **Admin interface** for managing deals (add/edit/delete, unlinked)
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
- **Admin Interface**: `/dealsmanager` - Full CRUD operations for deals
- **Public Display**: `/deals` - Read-only grid showing all active deals
- **Data Flow**: Admin changes → JSON storage → Public display (refresh to see updates)
- **Validation**: Zod schemas with field constraints (title 1-80 chars, category enum, etc.)
- **Rate Limiting**: All API endpoints protected by IP-based rate limiting

### Deal Structure
Each deal contains: `id` (UUID), `title`, `description`, `amountLabel`, `location`, `image` (path), `category` (restaurant/activity/hotel/tour), `expiry` (optional), `partner` (optional).

## Environment Variables

Copy `.env.example` to `.env.local`. None required yet.

## Development Workflows

### Adding New Pages
Use the scaffolding system to maintain consistency:
```bash
npm run scaffold:page -- --name "PageName" --route "/route" --title "Page Title"
```

### Managing Deals
- **Admin access**: Visit `/dealsmanager` directly (not linked in navigation)
- **Public viewing**: `/deals` shows all active deals in a responsive grid
- **Data persistence**: Changes save immediately to `data/deals.json`
- **Image assets**: Place images in `/public/images/`, reference as `/images/filename.ext`

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
pages/                  # Next.js pages (routing)
├── api/               # API endpoints (/api/*)
├── landing.tsx        # Main marketing page
├── deals.tsx          # Public deals display  
└── dealsmanager.tsx   # Admin deals management

src/
├── lib/               # Utilities & schemas
│   ├── forms.ts       # Zod validation schemas
│   └── dealsStore.ts  # JSON file operations
├── styles/            # Global styles & tokens
└── ui/                # React components
    ├── deals/         # Deals-specific components
    └── layout/        # Layout components

data/
└── deals.json         # Deal storage (JSON)
```

## Changelog

**2025-08-21** - Added deals management system with public/admin split. Public deals display at `/deals`, admin interface at `/dealsmanager`. JSON-based storage with full CRUD operations.

**2025-08-20** - Mailchimp integration removed. Form submissions to `/api/waitlist` and `/api/partner` now return success responses without external API calls. Previously collected data remains available in your Mailchimp account if you need to export it.

## Technical Stack

- **Frontend**: React 18 with TypeScript, Next.js 14 Pages Router
- **Styling**: Tailwind CSS with custom design tokens (`src/styles/tokens.css`)
- **Validation**: Zod schemas for form and API validation
- **Testing**: Jest + React Testing Library (unit), Playwright (visual/e2e)
- **Storage**: JSON file-based persistence with atomic writes (no external database)
- **Deployment**: Systemd service + Nginx reverse proxy

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

Pull changes & rebuild:
```bash
git pull origin main
npm ci
npm run build
sudo systemctl restart prtd
```

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

# Check deals data
curl http://localhost:4000/api/deals
```

## Documentation

- **System Overview**: `DEALS_SYSTEM.md` - Complete deals management documentation
- **Development Guide**: `CLAUDE.md` - Development setup and patterns for Claude Code

## License

Internal project.
# landingPagePRTD
