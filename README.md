# PRTD Landing

Marketing landing + styleguide built with Next.js 14 + Tailwind.

## Quick Start

```bash
npm ci
npm run dev
```

Visit http://localhost:3000/landing

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

## Health Check

`GET /api/health` returns JSON: `{ status: "ok" }`.

## Environment Variables

Copy `.env.example` to `.env.local`. None required yet.

## Design System

Tokens: `src/styles/tokens.css`. Primitives: `src/ui/*`. Styleguide page: `/styleguide`.

## Updating

Pull changes & rebuild:
```bash
git pull origin main
npm ci
npm run build
sudo systemctl restart prtd
```

## Logging

systemd captures stdout/stderr; or view custom log files configured in service example.

## License

Internal project.
# landingPagePRTD
