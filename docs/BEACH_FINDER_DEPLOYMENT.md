# Beach Finder Deployment Guide

## Overview

The Beach Finder Mini-App has been successfully implemented and is ready for deployment. This guide covers deployment steps, configuration, and maintenance.

## Features Implemented

- **Public Beach Finder** (`/beachfinder`)
  - Geolocation-based beach discovery
  - Advanced filtering (municipality, tags, distance)
  - Responsive design with beach cards
  - Analytics tracking for all interactions
  - SEO-optimized with proper meta tags

- **Admin Beach Manager** (`/beachesmanager`) 
  - CRUD operations for beach entries
  - Duplicate detection system
  - Image upload support
  - Audit logging for all changes
  - Admin authentication required

- **Robust Data Layer**
  - JSON file storage with atomic writes
  - File locking to prevent corruption
  - JSONL audit trail
  - Comprehensive Zod validation

## Pre-Deployment Checklist

### 1. Build Verification
```bash
cd /home/deploy/prtd
npm run build
```
✅ Build should complete successfully with only warnings (no TypeScript errors)

### 2. Type Safety Check
```bash
npx tsc --noEmit
```
✅ Should complete without errors

### 3. Data Directory Setup
```bash
# Production server only
sudo mkdir -p /var/prtd-data
sudo chown prtd:prtd /var/prtd-data
sudo chmod 750 /var/prtd-data
```

### 4. Seed Data
Copy the seed data to production:
```bash
# Development (optional - for testing)
cp data/beaches.json /var/prtd-data/beaches.json

# Or start with empty array
echo '[]' > /var/prtd-data/beaches.json
```

### 5. Environment Variables
Ensure `.env.local` or production environment has:
```bash
NODE_ENV=production
ADMIN_TOKEN=your_secure_admin_token_here
```

## Deployment Steps

### 1. Code Deployment
```bash
cd /home/deploy/prtd
git pull origin main  # or your deployment branch
npm ci
npm run build
```

### 2. Service Restart
```bash
sudo systemctl restart prtd
```

### 3. Health Check
```bash
curl -f http://localhost:4000/api/health
```
Should return: `{"status":"ok"}`

### 4. Feature Verification
- [ ] Visit `/beachfinder` - should load with beach grid
- [ ] Test geolocation prompt
- [ ] Test filtering functionality  
- [ ] Visit `/beachesmanager` - should prompt for authentication
- [ ] Test admin CRUD operations
- [ ] Verify analytics events in browser console (development)

## File Structure

```
/var/prtd-data/
├── beaches.json          # Main beach data store
├── beaches.json.lock     # File lock (temporary)
├── beaches.json.tmp      # Atomic write temp file (temporary)
└── beaches.log.jsonl     # Audit trail
```

## Monitoring & Maintenance

### 1. Health Monitoring
- Primary: `/api/health` endpoint
- Beach-specific: Check if `/beachfinder` loads successfully
- Admin access: Verify `/beachesmanager` authentication works

### 2. Data Backup
```bash
# Daily backup recommended
sudo cp /var/prtd-data/beaches.json /backup/beaches-$(date +%Y%m%d).json
sudo cp /var/prtd-data/beaches.log.jsonl /backup/beaches-audit-$(date +%Y%m%d).jsonl
```

### 3. Log Monitoring
```bash
# Application logs
sudo journalctl -u prtd -f

# Beach-specific audit log
sudo tail -f /var/prtd-data/beaches.log.jsonl
```

### 4. Performance Monitoring
- Monitor beach data file size (large datasets may need pagination)
- Watch for file lock contention in logs
- Monitor image upload storage usage

## Security Notes

### 1. Admin Access
- Admin token should be strong and rotated regularly
- Only accessible to authenticated admin users
- All admin actions are logged with IP addresses

### 2. File Permissions
```bash
# Verify correct permissions
ls -la /var/prtd-data/
# Should show: drwxr-x--- prtd prtd for directory
# Should show: -rw------- prtd prtd for files
```

### 3. Input Validation
- All data validated with Zod schemas
- Puerto Rico coordinates boundary checking
- Image uploads restricted to approved paths
- Rate limiting on API endpoints

## Troubleshooting

### Build Errors
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm ci
npm run build
```

### Permission Errors
```bash
# Fix data directory permissions
sudo chown -R prtd:prtd /var/prtd-data
sudo chmod 750 /var/prtd-data
sudo chmod 600 /var/prtd-data/*.json
sudo chmod 600 /var/prtd-data/*.jsonl
```

### Missing Beach Data
```bash
# Check if file exists and is readable
sudo -u prtd cat /var/prtd-data/beaches.json
# Should return valid JSON array
```

### Admin Authentication Issues
```bash
# Verify admin token is set
echo $ADMIN_TOKEN
# Check if cookie-based auth is working
# Clear browser cookies and try again
```

## Analytics Integration

The Beach Finder includes comprehensive analytics tracking:

- Beach finder page views
- Geolocation usage (granted/denied)
- Filter interactions (tags, municipality, distance)
- Beach card clicks with position tracking
- Directions clicks with source tracking
- Beach details views

All events are tracked via Google Analytics 4 with custom event parameters for detailed analysis.

## Future Enhancements

Consider these improvements for future releases:

1. **Map View**: Interactive map with beach markers
2. **User Reviews**: Beach rating and review system  
3. **Weather Integration**: Real-time weather and surf conditions
4. **Mobile App**: React Native version for mobile users
5. **Advanced Search**: Text search across beach names and descriptions
6. **Favorites**: User bookmark system for favorite beaches

## Support

For issues related to Beach Finder:
1. Check application logs: `sudo journalctl -u prtd -f`
2. Verify data file integrity: `sudo jq . /var/prtd-data/beaches.json`
3. Test API endpoints: `curl -f http://localhost:4000/api/beaches`
4. Report issues with detailed error messages and reproduction steps

---

**Deployment Date**: January 21, 2025  
**Version**: 1.0.0  
**Status**: Production Ready ✅