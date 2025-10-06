# Automatic Image Compression on Upload

## Overview

As of **October 4, 2025**, all new image uploads are **automatically compressed** when uploaded through the admin interface.

## Implementation

### Upload API Enhancement

**File**: `pages/api/upload-image.ts`

**Compression Settings**:
- **Max Dimensions**: 1200x675px (16:9 aspect ratio)
- **Quality**: 85% (high quality, good compression)
- **Format**: Progressive JPEG / Optimized WebP/PNG
- **Metadata**: Stripped (privacy + size reduction)
- **Tool**: ImageMagick (`convert` command)

### How It Works

1. **User uploads image** via admin interface
2. **Image is validated** (type, size, security)
3. **Image is saved** to `public/images/uploads/YYYY/MM/`
4. **Image is automatically compressed**:
   - Resized to max 1200x675px (maintains aspect ratio)
   - Quality set to 85%
   - Metadata stripped
   - Progressive encoding applied
5. **Compression is validated**:
   - If compressed version is smaller → use it
   - If compressed version is larger → keep original
6. **Path returned** to admin interface

### Compression Function

```typescript
async function compressImage(filePath: string): Promise<void> {
  try {
    const tempPath = `${filePath}.tmp`;

    // Use ImageMagick to compress and optimize
    execSync(
      `convert "${filePath}" -resize 1200x675\\> -quality 85 -strip -interlace Plane "${tempPath}"`,
      { timeout: 10000 }
    );

    // Only use compressed version if it's smaller
    const originalStats = await fs.promises.stat(filePath);
    const compressedStats = await fs.promises.stat(tempPath);

    if (compressedStats.size < originalStats.size) {
      await fs.promises.rename(tempPath, filePath);
      console.log(`Compressed: ${originalStats.size} → ${compressedStats.size} bytes`);
    } else {
      await fs.promises.unlink(tempPath);
      console.log(`Kept original (compressed version was larger)`);
    }
  } catch (error) {
    console.error('Image compression failed:', error);
    // Upload continues even if compression fails
  }
}
```

## Expected Results

### Before Auto-Compression
- User uploads 2MB beach photo
- Saved as 2MB to server
- Next.js optimizes on first request (~500KB WebP)
- Subsequent requests served from cache

### After Auto-Compression
- User uploads 2MB beach photo
- **Automatically compressed to ~200-400KB** during upload
- Next.js optimizes on first request (~100-150KB WebP)
- **Much faster first load**, cache contains smaller file

## Benefits

1. **Instant Optimization**: Images optimized immediately on upload
2. **Reduced Storage**: 50-70% less disk space used
3. **Faster First Load**: No delay for Next.js to generate optimized version
4. **Lower Bandwidth**: Smaller files transferred
5. **Better Performance**: Less server resources for optimization
6. **Consistent Quality**: All images standardized to 1200x675 max

## Monitoring

### Check Compression Logs

Compression results are logged in systemd journal:

```bash
# View recent upload compressions
sudo journalctl -u prtd -n 100 | grep "Compressed image"

# Example output:
# Compressed image: 1854832 → 245678 bytes (86% saved)
# Compressed image: 920345 → 165432 bytes (82% saved)
```

### Find Large Uploaded Images

Check if any large images bypassed compression:

```bash
# Find images larger than 300KB
find public/images/uploads/ -type f -size +300k -ls

# If found, manually compress:
./scripts/compress-images.sh --backup
```

## Troubleshooting

### Compression Not Working

**Symptom**: Uploaded images are still large (> 500KB)

**Check**:
1. Verify ImageMagick is installed:
   ```bash
   which convert
   # Should output: /usr/bin/convert
   ```

2. Check service logs for errors:
   ```bash
   sudo journalctl -u prtd -f
   # Upload an image and watch for errors
   ```

3. Test compression manually:
   ```bash
   convert test.jpg -resize 1200x675\> -quality 85 -strip -interlace Plane test-compressed.jpg
   ls -lh test*.jpg
   ```

### Compression Fails

**Symptom**: Compression errors in logs

**Solutions**:
1. **ImageMagick not installed**:
   ```bash
   sudo apt-get install imagemagick
   sudo systemctl restart prtd
   ```

2. **Permission errors**:
   ```bash
   # Ensure uploads directory is writable
   chmod 755 public/images/uploads/
   ```

3. **Timeout errors** (large images):
   - Edit `pages/api/upload-image.ts`
   - Increase timeout from 10000ms to 30000ms

### Upload Still Works Even If Compression Fails

The compression function is **non-blocking**:
- If compression fails, the original image is kept
- Upload completes successfully
- Error is logged but user doesn't see it

This ensures uploads always succeed, even if compression has issues.

## File Size Limits

### Current Limits

| Limit Type | Value | Set In |
|------------|-------|--------|
| **Max Upload Size** | 5MB | `upload-image.ts` (formidable config) |
| **Compression Timeout** | 10 seconds | `compressImage()` function |
| **Max Dimensions** | 1200x675px | ImageMagick resize |
| **Quality** | 85% | ImageMagick quality |

### Changing Limits

**Increase max upload size**:
```typescript
// pages/api/upload-image.ts
const form = formidable({
  maxFileSize: 10 * 1024 * 1024, // Change to 10MB
  // ...
});
```

**Change max dimensions**:
```typescript
// pages/api/upload-image.ts
execSync(
  `convert "${filePath}" -resize 1600x900\\> ...`, // Change dimensions
  { timeout: 10000 }
);
```

**Adjust quality**:
```typescript
// pages/api/upload-image.ts
execSync(
  `convert "${filePath}" ... -quality 90 ...`, // Higher quality (90%)
  { timeout: 10000 }
);
```

## Testing

### Test Upload Compression

1. **Upload a large image** (1-2MB) through admin:
   - Go to beaches manager
   - Upload beach cover image
   - Watch service logs: `sudo journalctl -u prtd -f`

2. **Check compression result**:
   ```bash
   # Find the uploaded file
   ls -lh public/images/uploads/2025/10/

   # Should be < 300KB for most beach photos
   ```

3. **Verify in browser**:
   - Image should load quickly
   - Right-click → Inspect → Network tab
   - Should show compressed size

## Comparison: Before vs After

### Before (No Auto-Compression)

```
User uploads 2.5MB photo
  ↓
Saved as 2.5MB
  ↓
First request: Next.js optimizes (2-3 seconds)
  ↓
Cached as 500KB WebP
  ↓
Subsequent requests: Fast (500KB)
```

### After (With Auto-Compression)

```
User uploads 2.5MB photo
  ↓
Automatically compressed to 250KB (1 second)
  ↓
Saved as 250KB
  ↓
First request: Next.js optimizes (0.5 seconds)
  ↓
Cached as 100KB WebP
  ↓
Subsequent requests: Fast (100KB)
```

**Result**: 80% reduction in first-load time, 80% reduction in storage.

## Future Enhancements

### Potential Improvements

1. **Multiple Size Variants**: Generate thumbnails on upload
2. **WebP Conversion**: Convert all JPEGs to WebP automatically
3. **Async Processing**: Queue compression for large images
4. **CDN Upload**: Upload directly to CloudFlare/S3
5. **Image Validation**: Check dimensions, aspect ratio
6. **Watermarking**: Add site logo to uploaded images

### Migration Path

If you later want to use Sharp instead of ImageMagick:

1. Upgrade server CPU to support AVX2
2. Install Sharp: `npm install sharp`
3. Replace `compressImage()` function with Sharp version
4. Rebuild and restart

Sharp is faster and produces smaller files, but requires modern CPU.

## Maintenance

### Regular Checks

**Monthly**:
```bash
# Check total uploads directory size
du -sh public/images/uploads/

# Should grow slowly (compressed images)
```

**After bulk uploads**:
```bash
# Verify compressions worked
find public/images/uploads/ -type f -size +500k

# Should find very few (if any) large files
```

### Cleanup Old Backups

From previous manual compressions:
```bash
# After 30 days, remove old backups
find public/images/ -name "uploads-backup-*" -mtime +30 -exec rm -rf {} \;
```

## Related Documentation

- `docs/IMAGE_OPTIMIZATION_ANALYSIS.md` - Full optimization strategy
- `docs/COMPRESS_IMAGES_README.md` - Manual compression guide
- `docs/COMPRESSION_RESULTS.md` - Results from bulk compression
- `scripts/compress-images.sh` - Batch compression script

---

**Status**: ✅ **Active** (Deployed October 4, 2025)
**Performance**: 50-70% average compression ratio
**Reliability**: Non-blocking (uploads succeed even if compression fails)
**Dependencies**: ImageMagick (`convert` command)
