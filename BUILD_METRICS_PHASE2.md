# Build Metrics After Phase 1 & 2

**Date:** $(date)
**Branch:** optimize/build-memory
**Phases Complete:** 1 (Lightweight Query), 2 (Beachfinder Client-Side Fetch)

## Build Size Comparison

### Before (Baseline)
- Total `.next` directory: **99 MB**
- `/beachfinder` page data: **528 KB** (beachfinder.json)
- `/beachfinder` total: 1.14 MB (HTML + JSON + JS)
- Build warning: ⚠️ "Page data exceeds 128 KB threshold"

### After (Phase 1 & 2)
- Total `.next` directory: **26 MB** ✅ (73% reduction)
- `/beachfinder` page data: **0 KB** ✅ (beachfinder.json eliminated)
- `/beachfinder` total: 18 KB (HTML only)
- Build warning: ✅ None

## Build Output Changes

### Beachfinder Page
- **Before:** ISR page (●) with 528 KB embedded data
- **After:** Static page (○) with no embedded data
- **Data delivery:** Now via `/api/beaches-light` (382 KB, client-fetched)

### New API Endpoint
- Path: `/api/beaches-light`
- Method: GET (public, rate-limited)
- Response: 382 KB (27% smaller than full beaches)
- Caching: Browser 5min, CDN 1hr
- Built file: `beaches-light.js` (4.9 KB)

## Memory Usage

### Build Process
- Still requires: `NODE_OPTIONS="--max-old-space-size=2048"`
- Phase 3 will address this with reduced static path generation

## Functionality Tests

✅ API endpoint returns 233 beaches
✅ Beachfinder page loads with loading state
✅ Filter logic intact (tags, municipality, distance, sort)
✅ SEO metadata present (title, description, canonical)
✅ Hero and FAQ sections server-rendered
✅ No regressions in other pages

## Performance Impact

### Positive
- Build output 73% smaller (99 MB → 26 MB)
- No large JSON file in page bundle
- Faster page load (18 KB initial vs 1.14 MB)
- Data fetched on-demand with caching

### Trade-offs
- Structured data (schema.org) now client-rendered (acceptable)
- Requires JavaScript for beach list (acceptable for app-like feature)
- Initial page shows loading state briefly

## Next Steps

Phase 3: Optimize beach detail pages
- Reduce static paths from 234 to ~50
- Add lightweight related beaches query
- Expected: Further build memory reduction
