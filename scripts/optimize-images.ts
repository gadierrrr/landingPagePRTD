import sharp from 'sharp';
import { promises as fs } from 'fs';
import { join } from 'path';
import { glob } from 'glob';

interface ImageOptimizationConfig {
  inputDir: string;
  outputDir: string;
  formats: ('webp' | 'avif' | 'jpeg')[];
  sizes: number[];
  quality: number;
}

const DEFAULT_CONFIG: ImageOptimizationConfig = {
  inputDir: 'public/images/uploads',
  outputDir: 'public/images/optimized',
  formats: ['webp', 'avif', 'jpeg'],
  sizes: [384, 640, 750, 828, 1080, 1200, 1920],
  quality: 80
};

export async function optimizeImages(config: Partial<ImageOptimizationConfig> = {}) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  // Find all images
  const imageFiles = await glob(`${finalConfig.inputDir}/**/*.{jpg,jpeg,png,webp}`, {
    absolute: true
  });

  console.log(`Found ${imageFiles.length} images to optimize`);

  for (const imagePath of imageFiles) {
    try {
      await optimizeSingleImage(imagePath, finalConfig);
    } catch (error) {
      console.error(`Failed to optimize ${imagePath}:`, error);
    }
  }

  console.log('Image optimization complete!');
}

async function optimizeSingleImage(
  imagePath: string,
  config: ImageOptimizationConfig
) {
  const filename = imagePath.split('/').pop()!;
  const nameWithoutExt = filename.replace(/\.(jpg|jpeg|png|webp)$/i, '');

  // Get image metadata
  const metadata = await sharp(imagePath).metadata();
  const originalSize = (await fs.stat(imagePath)).size;

  console.log(`\nOptimizing ${filename} (${(originalSize / 1024).toFixed(0)} KB)`);

  let totalSaved = 0;

  // Generate responsive sizes
  for (const width of config.sizes) {
    // Skip if image is smaller than target size
    if (metadata.width && metadata.width < width) continue;

    for (const format of config.formats) {
      const outputPath = join(
        config.outputDir,
        `${nameWithoutExt}-${width}w.${format}`
      );

      await fs.mkdir(config.outputDir, { recursive: true });

      const result = await sharp(imagePath)
        .resize(width, undefined, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .toFormat(format, {
          quality: config.quality,
          ...(format === 'jpeg' && { mozjpeg: true }),
          ...(format === 'webp' && { effort: 6 }),
          ...(format === 'avif' && { effort: 9 })
        })
        .toFile(outputPath);

      const saved = originalSize - result.size;
      totalSaved += saved;

      console.log(
        `  ✓ ${width}w ${format.toUpperCase()}: ${(result.size / 1024).toFixed(0)} KB ` +
        `(saved ${(saved / 1024).toFixed(0)} KB)`
      );
    }
  }

  console.log(`  Total saved: ${(totalSaved / 1024).toFixed(0)} KB`);
}

// CLI execution
if (require.main === module) {
  optimizeImages().catch(console.error);
}