#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

interface CompressionStats {
  processed: number;
  skipped: number;
  failed: number;
  totalOriginalSize: number;
  totalCompressedSize: number;
  errors: Array<{ file: string; error: string }>;
}

interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  dryRun?: boolean;
  backupDir?: string;
  force?: boolean; // Recompress even if already compressed
}

const DEFAULT_OPTIONS: Required<CompressionOptions> = {
  maxWidth: 1200,
  maxHeight: 675,
  quality: 85,
  dryRun: false,
  backupDir: '',
  force: false,
};

/**
 * Check if image needs compression by comparing file size vs expected size
 */
async function needsCompression(filePath: string, force: boolean): Promise<boolean> {
  if (force) return true;

  const stats = await fs.stat(filePath);
  const metadata = await sharp(filePath).metadata();

  // If image is already small enough (< 200KB) and properly sized, skip it
  if (stats.size < 200 * 1024 && metadata.width && metadata.width <= 1200) {
    return false;
  }

  return true;
}

/**
 * Compress a single image file
 */
async function compressImage(
  filePath: string,
  options: Required<CompressionOptions>
): Promise<{ originalSize: number; compressedSize: number; skipped: boolean }> {
  const stats = await fs.stat(filePath);
  const originalSize = stats.size;

  // Check if compression needed
  if (!await needsCompression(filePath, options.force)) {
    return { originalSize, compressedSize: originalSize, skipped: true };
  }

  // Create backup if requested
  if (options.backupDir) {
    const backupPath = path.join(options.backupDir, path.basename(filePath));
    await fs.copyFile(filePath, backupPath);
  }

  // Compress image to temporary file
  const tempPath = filePath + '.tmp';
  const ext = path.extname(filePath).toLowerCase();

  let pipeline = sharp(filePath)
    .resize(options.maxWidth, options.maxHeight, {
      fit: 'inside',
      withoutEnlargement: true,
    });

  // Apply format-specific compression
  if (ext === '.jpg' || ext === '.jpeg') {
    pipeline = pipeline.jpeg({
      quality: options.quality,
      progressive: true,
      mozjpeg: true // Better compression
    });
  } else if (ext === '.png') {
    pipeline = pipeline.png({
      quality: options.quality,
      compressionLevel: 9,
      palette: true // Use palette for smaller files
    });
  } else if (ext === '.webp') {
    pipeline = pipeline.webp({
      quality: options.quality,
      effort: 6
    });
  }

  await pipeline.toFile(tempPath);

  // Check compressed size
  const compressedStats = await fs.stat(tempPath);
  const compressedSize = compressedStats.size;

  // Only replace if compressed version is smaller
  if (compressedSize < originalSize) {
    if (!options.dryRun) {
      await fs.rename(tempPath, filePath);
      await fs.chmod(filePath, 0o644);
    } else {
      await fs.unlink(tempPath);
    }
  } else {
    // Compressed version is larger, keep original
    await fs.unlink(tempPath);
    return { originalSize, compressedSize: originalSize, skipped: true };
  }

  return { originalSize, compressedSize, skipped: false };
}

/**
 * Find all image files in directory recursively
 */
async function findImages(dir: string): Promise<string[]> {
  const images: string[] = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      images.push(...await findImages(fullPath));
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
        images.push(fullPath);
      }
    }
  }

  return images;
}

/**
 * Format bytes to human readable size
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Main compression function
 */
async function compressExistingImages(
  uploadDir: string,
  options: CompressionOptions = {}
): Promise<CompressionStats> {
  const opts: Required<CompressionOptions> = { ...DEFAULT_OPTIONS, ...options };

  const stats: CompressionStats = {
    processed: 0,
    skipped: 0,
    failed: 0,
    totalOriginalSize: 0,
    totalCompressedSize: 0,
    errors: [],
  };

  console.log('🔍 Scanning for images...');
  const images = await findImages(uploadDir);
  console.log(`📸 Found ${images.length} images\n`);

  if (opts.dryRun) {
    console.log('🧪 DRY RUN MODE - No files will be modified\n');
  }

  // Create backup directory if needed
  if (opts.backupDir && !opts.dryRun) {
    await fs.mkdir(opts.backupDir, { recursive: true });
    console.log(`💾 Backups will be saved to: ${opts.backupDir}\n`);
  }

  // Process each image
  for (let i = 0; i < images.length; i++) {
    const imagePath = images[i];
    const fileName = path.basename(imagePath);

    try {
      console.log(`[${i + 1}/${images.length}] Processing: ${fileName}`);

      const result = await compressImage(imagePath, opts);

      stats.totalOriginalSize += result.originalSize;
      stats.totalCompressedSize += result.compressedSize;

      if (result.skipped) {
        stats.skipped++;
        console.log(`  ⏭️  Skipped (already optimized or larger after compression)`);
      } else {
        stats.processed++;
        const saved = result.originalSize - result.compressedSize;
        const percent = Math.round((saved / result.originalSize) * 100);
        console.log(`  ✅ ${formatBytes(result.originalSize)} → ${formatBytes(result.compressedSize)} (saved ${percent}%)`);
      }
    } catch (error) {
      stats.failed++;
      const errorMsg = error instanceof Error ? error.message : String(error);
      stats.errors.push({ file: fileName, error: errorMsg });
      console.log(`  ❌ Failed: ${errorMsg}`);
    }

    console.log('');
  }

  return stats;
}

/**
 * CLI interface
 */
async function main() {
  const args = process.argv.slice(2);

  // Parse arguments
  const dryRun = args.includes('--dry-run');
  const force = args.includes('--force');
  const withBackup = args.includes('--backup');

  const uploadDir = path.join(process.cwd(), 'public', 'images', 'uploads');
  const backupDir = withBackup
    ? path.join(process.cwd(), 'public', 'images', 'uploads-backup-' + Date.now())
    : '';

  console.log('🖼️  Beach Image Compression Tool\n');
  console.log('📁 Upload directory:', uploadDir);
  console.log('⚙️  Settings:');
  console.log('   - Max dimensions: 1200x675px');
  console.log('   - Quality: 85%');
  console.log('   - Format: Progressive JPEG');
  console.log('   - Dry run:', dryRun ? 'YES' : 'NO');
  console.log('   - Force recompression:', force ? 'YES' : 'NO');
  console.log('   - Create backups:', withBackup ? 'YES' : 'NO');
  console.log('');

  const startTime = Date.now();

  const stats = await compressExistingImages(uploadDir, {
    maxWidth: 1200,
    maxHeight: 675,
    quality: 85,
    dryRun,
    backupDir,
    force,
  });

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  // Print summary
  console.log('━'.repeat(60));
  console.log('📊 COMPRESSION SUMMARY');
  console.log('━'.repeat(60));
  console.log(`✅ Processed:     ${stats.processed} images`);
  console.log(`⏭️  Skipped:       ${stats.skipped} images`);
  console.log(`❌ Failed:        ${stats.failed} images`);
  console.log(`⏱️  Time:          ${duration}s`);
  console.log('');
  console.log(`📦 Original size:  ${formatBytes(stats.totalOriginalSize)}`);
  console.log(`📦 Compressed:     ${formatBytes(stats.totalCompressedSize)}`);

  const totalSaved = stats.totalOriginalSize - stats.totalCompressedSize;
  const percentSaved = stats.totalOriginalSize > 0
    ? Math.round((totalSaved / stats.totalOriginalSize) * 100)
    : 0;

  console.log(`💾 Space saved:    ${formatBytes(totalSaved)} (${percentSaved}%)`);
  console.log('');

  if (stats.errors.length > 0) {
    console.log('⚠️  ERRORS:');
    stats.errors.forEach(({ file, error }) => {
      console.log(`   ${file}: ${error}`);
    });
    console.log('');
  }

  if (dryRun) {
    console.log('💡 This was a dry run. Run without --dry-run to compress images.');
  } else if (withBackup) {
    console.log(`💾 Original images backed up to: ${backupDir}`);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { compressExistingImages, compressImage, findImages };
