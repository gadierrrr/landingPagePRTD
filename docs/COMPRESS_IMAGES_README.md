# Image Compression Guide

## Overview

Two compression scripts are available to optimize existing uploaded beach images:

1. **compress-images.sh** (bash/ImageMagick) - ✅ **Recommended** (works on current server)
2. **compress-existing-images.ts** (Node.js/Sharp) - ❌ Requires CPU with AVX2 support

## Quick Start

### Option 1: Dry Run (Preview Only)
```bash
./scripts/compress-images.sh --dry-run
```

This will show you:
- How many images will be compressed
- Size reduction for each image
- Total space savings
- **No files are modified**

### Option 2: Compress with Backup
```bash
./scripts/compress-images.sh --backup
```

This will:
- Create a backup directory with timestamp
- Compress all images
- Keep original files in backup

### Option 3: Compress (No Backup)
```bash
./scripts/compress-images.sh
```

⚠️ **Warning**: This modifies files in-place. Backups recommended!

## Test Results (Dry Run)

From our test run on 77 images:

| Metric | Result |
|--------|--------|
| **Total Images** | 77 |
| **Will Compress** | ~45 images |
| **Will Skip** | ~31 images (already optimized) |
| **Failed** | ~1 image (corrupt/unsupported) |
| **Average Savings** | 50-70% per image |
| **Top Savings** | Up to 90% on some WebP files |

### Example Compressions
- 685KB → 62KB (90% saved) - Peña Blanca Beach
- 637KB → 106KB (83% saved) - Rompeola Beach
- 618KB → 105KB (82% saved) - Combate Beach
- 906KB → 280KB (69% saved) - Gallery Inn
- 1003KB → 338KB (66% saved) - Favicon PNG

## Compression Settings

- **Max Dimensions**: 1200x675px (16:9 aspect ratio)
- **Quality**: 85% (high quality, good compression)
- **Format**: Progressive JPEG
- **Interlacing**: Enabled (faster perceived load)
- **Metadata**: Stripped (privacy & size)

## Safety Features

1. **Size Check**: Only replaces if compressed version is smaller
2. **Optimization Check**: Skips images already optimized (< 200KB)
3. **Dry Run Mode**: Test before making changes
4. **Backup Option**: Preserve originals
5. **Permissions**: Sets 644 on compressed files

## After Compression

### Update Database (if paths changed)
If you renamed files, update the database:
```bash
npx tsx scripts/import-beaches-to-sqlite.ts
```

### Clear Next.js Image Cache
```bash
rm -rf .next/cache/images
```

### Restart Service
```bash
sudo systemctl restart prtd
```

### Clear CDN Cache (if using CloudFlare)
Go to CloudFlare dashboard > Caching > Purge Everything

## Troubleshooting

### "ImageMagick not found"
```bash
sudo apt-get install imagemagick
```

### "convert command error"
Some images may be corrupt. The script will skip them and continue.

### Files not compressing
- Already optimized (< 200KB and correct size)
- Use `--force` flag to recompress anyway

### Backup directory full
Backups are stored in: `public/images/uploads-backup-{timestamp}/`

Clean up old backups:
```bash
rm -rf public/images/uploads-backup-*
```

## Production Recommendation

For production deployment, run with backup:

```bash
# 1. Dry run first
./scripts/compress-images.sh --dry-run

# 2. Review output

# 3. Compress with backup
./scripts/compress-images.sh --backup

# 4. Test website
# Visit https://puertoricotraveldeals.com/beaches

# 5. If all looks good, clear Next.js cache
rm -rf .next/cache/images

# 6. Restart service
sudo systemctl restart prtd

# 7. After 24 hours, remove backup
rm -rf public/images/uploads-backup-*
```

## Expected Impact

**Before Compression:**
- Average beach image: 400-600KB
- 37 custom images: ~18MB total
- Page load: ~2-3s for images

**After Compression:**
- Average beach image: 100-200KB (50-70% reduction)
- 37 custom images: ~5-8MB total
- Page load: ~0.8-1.2s for images

Combined with Next.js Image optimization (WebP/AVIF conversion), final delivery size: **~50-100KB per image**.

## Future Optimizations

After compression, consider:
1. **Nginx Direct Serving**: Bypass Node.js API (see IMAGE_OPTIMIZATION_ANALYSIS.md)
2. **CloudFlare CDN**: Edge caching + automatic format conversion
3. **Blur Placeholders**: Better perceived performance
4. **Preloading**: First beach card loads faster

See `docs/IMAGE_OPTIMIZATION_ANALYSIS.md` for full optimization roadmap.
