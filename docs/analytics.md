# PRTD Analytics Monitoring SOP

## Quick Commands

```bash
# Check current analytics health
prtd-health

# Run full validation (7-day analysis)
prtd-validate

# Monitor real-time activity for 5 minutes
prtd-monitor 5 30
```

## Understanding Output

### Health Check (`prtd-health`)
- **Status Icons**: 🟢 HEALTHY | 🟡 WARNING | 🔴 CRITICAL
- **Score**: 0-100% based on tracking completeness and activity
- **Active Users**: Current visitors (last 29 minutes)
- **Events (29min)**: Real-time event count
- **Events (24h)**: Yesterday's total events

**When to investigate**:
- Score < 50%: Critical tracking issues
- Active Users = 0 during business hours: Site or tracking problem
- Events (24h) < 100: Unusually low traffic

### Validation (`prtd-validate`)
- **Overall Score**: Weighted average of all checks
- **PASS/FAIL**: Based on 70% threshold
- **Key Metrics**: 7-day totals and conversion rates
- **Missing Events**: Events that should fire but don't

**Expected baseline**:
- Page Views: 50+ daily
- Deal Clicks: 2+ daily  
- Conversion Rate: 1-5%

## Logs and Scheduling

### Log Locations
```bash
# View recent health checks
sudo journalctl -u prtd-health.service -n 20

# View validation logs
sudo journalctl -u prtd-validate.service -n 10

# Direct log files
tail -f /var/log/prtd-analytics/health.log
tail -f /var/log/prtd-analytics/validate.log
```

### Automated Schedule
- **Health Check**: Every 30 minutes
- **Validation**: Daily at random time (±30min)
- **Timer Status**: `systemctl list-timers | grep prtd`

## GA4 Custom Dimensions (✅ Configured)

These custom dimensions are already configured in your GA4 property:

| Dimension | Purpose | Example Values |
|-----------|---------|----------------|
| `slug` | Deal/page identifier | `hotel-deals`, `flight-specials` |
| `deal_id` | Unique deal tracking | `deal_123`, `promo_abc` |
| `vendor_id` | Partner/vendor ID | `marriott`, `delta`, `enterprise` |
| `category` | Deal category | `hotels`, `flights`, `cars`, `activities` |
| `position` | Layout position | `hero`, `grid_1`, `sidebar` |
| `section_version` | A/B test variant | `v1`, `v2`, `control` |
| `src` | Traffic source detail | `email`, `social`, `paid` |
| `cta_id` | Call-to-action ID | `book_now`, `learn_more`, `view_deal` |
| `form_location` | Form context | `homepage`, `deal_page`, `checkout` |
| `status_code` | API response codes | `200`, `404`, `500` |
| `error_code` | Error categorization | `validation`, `payment`, `network` |
| `request_id` | Debug trace ID | UUID for request tracking |

## Troubleshooting

### Common Issues

**No Active Users**
1. Check if website is accessible: `curl -I https://puertoricotraveldeals.com`
2. Verify GA4 tracking code in HTML source
3. Check for JavaScript errors in browser console

**Low Event Counts**
1. Review recent deployments for tracking code changes
2. Test event firing with GA4 Debug View
3. Verify measurement ID matches: `G-EF509Z3W9G` → property `502239171`

**Missing Events**
1. Check if events are properly implemented in code
2. Test user flows that should trigger events
3. Review console errors during event firing

**Score Dropping**
1. Compare current metrics with historical data
2. Check for traffic pattern changes
3. Review recent A/B tests or feature changes

### Emergency Actions

**Critical Tracking Failure (Score < 30%)**
1. Immediately check website accessibility
2. Review deployment logs for recent changes
3. Test GA4 Real-Time reports directly
4. Escalate to development team

**Data Discrepancies**
1. Cross-check with Google Analytics UI
2. Verify timezone settings (EST/UTC)
3. Compare with server logs and CDN analytics

## Credential Management

### Rotation Schedule
- **Service Account Key**: Rotate every 90 days
- **Property Access**: Review quarterly

### Rotation Process
1. Create new service account key in Google Cloud Console
2. Download new JSON file to `/home/deploy/prtd-ga4-credentials-new.json`
3. Test with new credentials: `GOOGLE_APPLICATION_CREDENTIALS=/home/deploy/prtd-ga4-credentials-new.json prtd-health`
4. If successful, replace old file and restart services:
   ```bash
   sudo cp /home/deploy/prtd-ga4-credentials-new.json /home/deploy/prtd-ga4-credentials.json
   sudo chmod 600 /home/deploy/prtd-ga4-credentials.json
   sudo systemctl restart prtd-health.timer prtd-validate.timer
   ```
5. Delete old key from Google Cloud Console

### Custom Dimensions Management
```bash
# View current custom dimensions
prtd-setup-dimensions --list

# Recreate dimensions if needed (safe to re-run)
prtd-setup-dimensions
```

### Access Requirements
- **Service Account**: Analytics Reader role on GA4 property
- **File Permissions**: 600 (owner read-only)
- **Property ID**: Must use numeric ID (502239171), not measurement ID

## Contact

For analytics issues or questions:
- **Technical Issues**: Development team
- **Data Questions**: Product/Marketing team  
- **Access Issues**: System administrator

---

*Last updated: 2025-09-20*