import sharp from 'sharp';
import { promises as fs } from 'fs';
import { join } from 'path';
import { watch } from 'chokidar';
import { glob } from 'glob';

const UPLOAD_DIR = 'public/images/uploads';
const FORMATS = ['webp', 'avif'] as const;

async function processImage(filePath: string) {
  console.log(`Processing: ${filePath}`);

  const ext = filePath.match(/\.(jpg|jpeg|png)$/i)?.[1];
  if (!ext) return;

  const dir = filePath.substring(0, filePath.lastIndexOf('/'));
  const filename = filePath.split('/').pop()!;
  const nameWithoutExt = filename.replace(/\.(jpg|jpeg|png)$/i, '');

  // Convert to WebP and AVIF
  for (const format of FORMATS) {
    const outputPath = join(dir, `${nameWithoutExt}.${format}`);

    await sharp(filePath)
      .toFormat(format, {
        quality: 85,
        ...(format === 'webp' && { effort: 6 }),
        ...(format === 'avif' && { effort: 6 }) // Reduce from 9 for speed
      })
      .toFile(outputPath);

    const originalSize = (await fs.stat(filePath)).size;
    const newSize = (await fs.stat(outputPath)).size;
    const saved = ((1 - newSize / originalSize) * 100).toFixed(1);

    console.log(`  ✓ ${format.toUpperCase()}: ${saved}% smaller`);
  }
}

// Watch mode for development
if (process.argv.includes('--watch')) {
  console.log(`Watching ${UPLOAD_DIR} for new images...`);

  const watcher = watch(`${UPLOAD_DIR}/**/*.{jpg,jpeg,png}`, {
    persistent: true,
    ignoreInitial: false
  });

  watcher.on('add', processImage);
  watcher.on('change', processImage);
}

// One-time processing
if (require.main === module && !process.argv.includes('--watch')) {
  (async () => {
    try {
      const files = await glob(`${UPLOAD_DIR}/**/*.{jpg,jpeg,png}`);
      console.log(`Found ${files.length} images to process`);
      for (const file of files) {
        await processImage(file);
      }
      console.log('Image processing complete!');
    } catch (err) {
      console.error('Error processing images:', err);
      process.exit(1);
    }
  })();
}