# Build Metrics Baseline
**Captured:** $(date)
**Branch:** optimize/build-memory
**Node Version:** $(node --version)
**Next.js Version:** 14.2.32

## Current Build Configuration
- Build command: `NODE_OPTIONS="--max-old-space-size=2048" npm run build`
- Memory required: 2048 MB (fails at default 512 MB)
- Build strategy: Full static generation with ISR

## Build Output Metrics

### Overall Build Size
- Total `.next` directory: 99 MB

### Page-Specific Metrics

#### /beachfinder Page
- beachfinder.json: 528 KB ⚠️ **EXCEEDS 128 KB THRESHOLD**
- beachfinder.html: 592 KB
- beachfinder.js: 28 KB
- **Total page bundle:** 1.14 MB
- **Warning:** Data for page is 538 KB (4.2x over Next.js recommended 128 KB)

#### /beaches/[slug] Pages
- Total beaches directory: 20 MB
- Number of JSON files: 234 beaches
- Average JSON per beach: ~85 KB (20 MB ÷ 234)
- Total HTML size: ~14 MB (estimated)

### Static Generation Stats
- Total static pages: 271 pages
- Beach detail pages: 234 pages (86% of total static pages)
- ISR revalidation: 3600s (1 hour) for beach pages

## Memory Usage During Build
- Required: 2048 MB (`--max-old-space-size=2048`)
- Default Node.js heap: ~512 MB
- Memory overhead: **4x default heap size**

## Database Stats
- Database size: 1008 KB (1 MB)
- Total beaches: 233
- Average beach record size: ~4.3 KB
- Database queries during build: Estimated 234+ (one per beach page + beachfinder)

## Problem Areas Identified

### 1. Beachfinder Page (538 KB data)
**Root cause:** `getStaticProps` loads all 233 beaches with full data
```typescript
// pages/beachfinder.tsx:615
const beaches = isSqliteEnabled() ? await getAllBeaches() : await readBeaches();
```
**Impact:** Embeds entire beach dataset in page bundle

### 2. Beach Detail Pages (234 × getAllBeaches calls)
**Root cause:** Each beach page loads all beaches for related beach calculation
```typescript
// pages/beaches/[slug].tsx:359
const allBeaches = isSqliteEnabled() ? await getAllBeaches() : await readBeaches();
```
**Impact:** 233 pages × 233 beaches = 54,289 beach object loads during build

### 3. Rich Content Expansion
- Database grew from 440 KB → 1008 KB (2.3x) after content generation
- New fields per beach: description, parkingDetails, safetyInfo, localTips, bestTime, features[], tips[]
- Each beach object significantly larger in memory

## Target Metrics (Post-Optimization)

### Build Requirements
- Memory: <1 GB (ideally default 512 MB)
- Build time: <5 minutes
- No build warnings about page data size

### Page Sizes
- /beachfinder data: <150 KB (70% reduction from 538 KB)
- Beach detail pages: Reduced static generation to 50 pages
- Remaining pages: On-demand via fallback: 'blocking'

### Performance
- API endpoint `/api/beaches/light`: <100ms response time
- Beach detail page generation: <500ms per page
- Related beaches query: <50ms

## Optimization Strategy Summary

1. **Phase 1:** Lightweight beach list query (exclude rich content)
2. **Phase 2:** Convert /beachfinder to client-side fetch
3. **Phase 3:** Reduce static paths to top 50 beaches + optimize related beaches
4. **Phase 4:** (Optional) Pre-compute related beaches cache
5. **Phase 5:** Image optimization (separate)
6. **Phase 6:** Build config tuning

**Expected outcome:** Build with default Node.js memory, no warnings, faster builds
