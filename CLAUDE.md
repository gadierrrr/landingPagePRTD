# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Start development server:**
```bash
npm ci
npm run dev
```
Visit http://localhost:3000/landing for the main landing page.

**Build and test commands:**
- `npm run build` - Production build
- `npm test` - Run Jest unit tests
- `npm run test:ui` - Run Playwright visual & smoke tests
- `npm run lint` - ESLint TypeScript/JavaScript files
- `npm run stylelint` - Lint CSS files

**Single test execution:**
- Jest: `npm test -- --testNamePattern="test name"`
- Playwright smoke tests: `npx playwright test --grep @smoke`

**Production verification:**
```bash
npm run build
NODE_ENV=production npm start
```

**Page scaffolding:**
```bash
npm run scaffold:page -- PageName
```
Creates a new page in `pages/PageName.tsx` with SiteLayout wrapper.

## Architecture Overview

This is a Next.js 14 marketing site using Pages Router with TypeScript and Tailwind CSS.

**Key directories:**
- `pages/` - Next.js pages (landing page is main focus)
- `src/ui/` - Reusable React components organized by type
- `src/styles/` - Global styles and design tokens
- `__tests__/` - Jest unit tests
- `tests/visual/` - Playwright visual regression tests
- `deploy/` - Deployment configuration files

**Design system:**
- Design tokens are centralized in `src/styles/tokens.css` as CSS custom properties
- Component library in `src/ui/` with primitives (Button, Heading, Section)
- Brand colors: navy, sand, blue, red (see src/styles/tokens.css)
- SiteLayout component provides consistent page wrapper with brand styling

**Styling constraints:**
- Raw hex colors are forbidden (enforced by ESLint rule)
- Must use design tokens or Tailwind theme colors
- Stylelint enforces no hex colors in CSS

**Testing strategy:**
- Jest for unit tests with React Testing Library
- Playwright for visual regression and smoke tests
- Visual tests capture screenshots for desktop/mobile/tablet viewports

**Health monitoring:**
- `/api/health` endpoint returns `{ status: "ok" }`
- `/healthz` endpoint available via Nginx for load balancer checks
- Useful for deployment health checks

**Production deployment:**
- Domain: puertoricotraveldeals.com
- App server runs on port 4000 (systemd service)
- Nginx reverse proxy with SSL/HTTPS support ready
- Deployment configs in `deploy/` directory

**Page structure:**
All pages should use SiteLayout wrapper and follow the component hierarchy: SiteLayout > Section > Heading + content.

## 5-Step Onboarding Plan

### 1. Local Development Setup
- **Quick start:** `npm ci && npm run dev` → http://localhost:3000/landing
- **Environment:** Copy `.env.example` to `.env.local` (no vars required currently)
- **New pages:** Use `npm run scaffold:page -- PageName` or follow `pages/landing.tsx` pattern
- **Components:** Add to `src/ui/` hierarchy (primitives vs page-specific folders)
- **Styling:** Reference `src/styles/tokens.css` variables, never raw hex colors

### 2. Code Quality Rules
- **Pre-commit:** Always run `npm run lint && npm run stylelint && npx tsc --noEmit`
- **Design system:** No raw hex colors (ESLint enforced), use design tokens only
- **Tailwind:** Classes auto-ordered by linter, use shorthand where available (`size-9` vs `h-9 w-9`)
- **TypeScript:** Strict mode enabled, all components must be properly typed

### 3. Build & Test Workflow
- **Production build:** `npm run build` (outputs to `.next/` directory)
- **Unit tests:** `npm test` (Jest + React Testing Library)
- **Visual tests:** `npm run test:ui` (Playwright, optional for later - not required to ship)
- **Logs:** Build/test logs saved to `logs/` (git-ignored)
- **Type check:** `npx tsc --noEmit` (validate without emitting files)

### 4. Production Deployment
- **Server:** Systemd service on port 4000 (`deploy/systemd-prtd.service.example`)
- **Proxy:** Nginx reverse proxy (`deploy/nginx-prtd.conf.example`)
- **Domain:** puertoricotraveldeals.com (SSL-ready with Certbot)
- **Health checks:** `/api/health` (returns `{"status":"ok"}`)
- **Deploy:** `npm ci && npm run build && sudo systemctl restart prtd`
- **Unit file changes:** Add `sudo systemctl daemon-reload` before restart when service file changes

### 5. Safe Change Workflow
- **Branches:** Use feature branches from `main` (e.g., `feature/new-component`)
- **PR size:** Keep changes focused, max ~300 lines per PR for reviewability
- **Review checklist:** ✅ Tests pass ✅ Lint clean ✅ Design tokens used ✅ Mobile responsive
- **Pre-merge:** Run full test suite: `npm run lint && npm run build && npm test`
- **Post-deploy:** Verify health endpoints and landing page functionality