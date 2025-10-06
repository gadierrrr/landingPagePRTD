# Beach Cover Image Performance Analysis & Optimization Plan

## Current Setup Analysis

### Image Serving Architecture
1. **Upload Storage**: `public/images/uploads/YYYY/MM/` (18MB total)
2. **Serving Method**: Custom API route `/api/serve-upload/[...path].ts`
3. **Optimization**: Next.js Image component with AVIF/WebP conversion
4. **Caching**:
   - API route: `max-age=31536000, immutable`
   - Nginx: `max-age=31536000, immutable` for static assets
   - Next.js Image cache TTL: 24 hours

### Current Performance Metrics
- **Image sizes**: 79KB - 887KB (avg ~300KB for JPEGs)
- **Format**: Progressive JPEGs at 800x450px
- **Download speed**: ~13.7 MB/sec (local server)
- **Next.js optimization**: ✅ Working (AVIF/WebP conversion enabled)

### Identified Bottlenecks

#### 1. **Unoptimized Source Images** (CRITICAL)
- Images uploaded as full-size JPEGs (up to 887KB)
- No server-side compression on upload
- Progressive JPEGs help, but still large

#### 2. **API Route Overhead** (HIGH)
- Every image request goes through Node.js API handler
- File streaming via `fs.createReadStream()` adds latency
- No nginx direct file serving for uploads

#### 3. **No CDN** (HIGH)
- All images served from origin server
- No geographic distribution
- No edge caching

#### 4. **Missing Response Headers** (MEDIUM)
- API route returns 405 for HEAD requests (breaks preflight checks)
- No `Accept-Ranges` header for partial content

#### 5. **Suboptimal Next.js Image Config** (LOW)
- `unoptimized: false` is correct, but disabled in dev mode
- Missing `remotePatterns` (using deprecated `domains`)

## Optimization Recommendations

### Phase 1: Quick Wins (1-2 hours)

#### A. Fix API Route HEAD Support
```typescript
// pages/api/serve-upload/[...path].ts
if (req.method !== 'GET' && req.method !== 'HEAD') {
  return res.status(405).json({ error: 'Method not allowed' });
}

// For HEAD requests, send headers only
if (req.method === 'HEAD') {
  return res.status(200).end();
}
```

#### B. Add Image Compression on Upload
Install sharp: `npm i sharp`

```typescript
// pages/api/upload-image.ts
import sharp from 'sharp';

// After file upload, optimize it:
await sharp(finalPath)
  .resize(1200, 675, {
    fit: 'cover',
    withoutEnlargement: true
  })
  .jpeg({ quality: 85, progressive: true })
  .toFile(finalPath + '.tmp');

await fs.promises.rename(finalPath + '.tmp', finalPath);
```

**Expected Impact**: 50-70% size reduction (887KB → ~300KB)

#### C. Update Next.js Config
```javascript
// next.config.mjs
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'puertoricotraveldeals.com',
    }
  ],
  formats: ['image/avif', 'image/webp'],
  deviceSizes: [384, 640, 750, 828, 1080, 1200],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  minimumCacheTTL: 2592000, // 30 days (was 24 hours)
}
```

**Expected Impact**: Better browser caching

---

### Phase 2: Medium Effort (4-6 hours)

#### D. Nginx Direct File Serving
Bypass Node.js for uploaded images:

```nginx
# /etc/nginx/sites-available/prtd.conf
location ~ ^/api/serve-upload/(.+)$ {
    alias /home/deploy/prtd/public/images/uploads/$1;

    # Cache headers
    add_header Cache-Control "public, max-age=31536000, immutable" always;
    add_header X-Served-By "nginx" always;

    # CORS headers if needed
    add_header Access-Control-Allow-Origin "*" always;

    # Security
    add_header X-Content-Type-Options "nosniff" always;

    # Try file, fallback to Node.js API
    try_files $uri @nodejs;
}

location @nodejs {
    proxy_pass http://127.0.0.1:4000;
    # ... existing proxy settings
}
```

**Expected Impact**:
- 30-50% faster response times
- Reduced Node.js memory pressure
- Better concurrent request handling

#### E. Implement Image Preloading
```typescript
// src/ui/beaches/BeachesGrid.tsx
<link
  rel="preload"
  as="image"
  href={firstBeach.coverImage}
  imageSrcSet={`
    /_next/image?url=${encodeURIComponent(firstBeach.coverImage)}&w=384&q=75 384w,
    /_next/image?url=${encodeURIComponent(firstBeach.coverImage)}&w=640&q=75 640w
  `}
/>
```

**Expected Impact**: 20-30% faster LCP for first beach

---

### Phase 3: Long-term (1-2 days)

#### F. CloudFlare CDN Integration
1. Set up CloudFlare for puertoricotraveldeals.com
2. Configure image optimization settings:
   - Polish: Lossy
   - Mirage: On (lazy loading)
   - Cache Level: Standard
   - Browser Cache TTL: 1 year

**Expected Impact**:
- 80-90% faster load times globally
- Automatic WebP/AVIF conversion at edge
- DDoS protection included

**Cost**: Free tier covers ~20GB/month

#### G. Lazy Loading with Blur Placeholders
Generate blurhash on upload:

```typescript
import { encode } from 'blurhash';
import sharp from 'sharp';

// Generate thumbnail
const thumbnail = await sharp(finalPath)
  .resize(32, 32, { fit: 'cover' })
  .raw()
  .toBuffer({ resolveWithObject: true });

const blurhash = encode(
  thumbnail.data,
  thumbnail.info.width,
  thumbnail.info.height,
  4,
  3
);

// Store blurhash in database
```

Then use in Image component:
```tsx
<Image
  src={beach.coverImage}
  placeholder="blur"
  blurDataURL={beach.blurhash}
  // ...
/>
```

**Expected Impact**: Better perceived performance

#### H. Convert to Static Paths for Common Images
Move heavily-used beach images to `/public/images/beaches/`:
- Direct nginx serving (no API route)
- Better caching
- Simpler paths

---

## Performance Targets

### Current
- **Initial Load**: ~576KB for largest image
- **First Paint**: ~1.2s (estimated)
- **Concurrent Requests**: Limited by Node.js

### After Phase 1
- **Initial Load**: ~200KB (compressed)
- **First Paint**: ~0.8s
- **Concurrent Requests**: Still limited

### After Phase 2
- **Initial Load**: ~150KB (WebP/AVIF)
- **First Paint**: ~0.5s
- **Concurrent Requests**: 10x improvement

### After Phase 3
- **Initial Load**: ~80KB (CDN optimized)
- **First Paint**: ~0.2s
- **Global**: 50-200ms edge delivery

---

## Implementation Priority

1. **Immediate** (do today):
   - A. Fix HEAD request support
   - C. Update Next.js config

2. **This week**:
   - B. Add upload compression
   - D. Nginx direct serving

3. **This month**:
   - F. CloudFlare CDN
   - G. Blur placeholders

4. **Optional**:
   - H. Static paths for top beaches
   - E. Preloading (if LCP is still slow)

---

## Monitoring & Metrics

After implementing changes, track:
- **Lighthouse scores**: Run `npm run test:lighthouse`
- **Image sizes**: Check Network tab (should be 80-150KB)
- **LCP (Largest Contentful Paint)**: Target < 2.5s
- **Cache hit ratio**: Monitor nginx logs
- **CDN bandwidth savings**: CloudFlare analytics

---

## Files to Modify

1. `pages/api/serve-upload/[...path].ts` - HEAD support, range requests
2. `pages/api/upload-image.ts` - Sharp compression
3. `next.config.mjs` - remotePatterns, cache TTL
4. `/etc/nginx/sites-available/prtd.conf` - Direct serving
5. `db/schema.ts` - Add blurhash column (optional)
6. `src/ui/beaches/PublicBeachCard.tsx` - Blur placeholders (optional)
