# Nginx CSP Configuration Change - Tue Sep 30 06:29:40 PM UTC 2025

Updated /etc/nginx/sites-available/prtd.conf
Added basemaps.cartocdn.com (without subdomain) to connect-src directive
to fix MapLibre map loading CSP violation.

Backup created at: /etc/nginx/sites-available/prtd.conf.backup-20250930-182940

# Analytics Tracking Update - 2025-10-02 20:22:52 UTC

- Updated GA4 loader to send SPA page views and queue pre-init events.
- Normalized deal click event to `select_item` and cleared duplicate `view_item` emissions.
- Refreshed docs/scripts to match new event names.
- Rebuilt site with `npm run build`.

