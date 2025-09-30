#!/usr/bin/env node

/**
 * Generate optimized favicons and icons using Sharp
 * Resizes and optimizes the source favicon to multiple sizes
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'public');
const sourceFavicon = path.join(publicDir, 'favicon.png');

// Icon sizes to generate
const iconSizes = [
  { name: 'favicon-16x16.png', width: 16, height: 16 },
  { name: 'favicon-32x32.png', width: 32, height: 32 },
  { name: 'apple-touch-icon.png', width: 180, height: 180 },
  { name: 'icon-192.png', width: 192, height: 192 },
  { name: 'icon-512.png', width: 512, height: 512 },
];

// Publisher logo (wide format)
const publisherLogo = {
  name: 'logo-600x60.png',
  width: 600,
  height: 60
};

async function generateIcons() {
  console.log('🎨 Generating optimized icons with Sharp...\n');

  // Check if source file exists
  if (!fs.existsSync(sourceFavicon)) {
    console.error('❌ Source file not found: public/favicon.png');
    process.exit(1);
  }

  // Get source file stats
  const sourceStats = fs.statSync(sourceFavicon);
  const sourceSizeMB = (sourceStats.size / (1024 * 1024)).toFixed(2);
  console.log(`📊 Source file: ${sourceSizeMB}MB\n`);

  let successCount = 0;
  let failCount = 0;

  // Generate square icons
  for (const icon of iconSizes) {
    try {
      const outputPath = path.join(publicDir, icon.name);

      await sharp(sourceFavicon)
        .resize(icon.width, icon.height, {
          fit: 'contain',
          background: { r: 135, g: 206, b: 235, alpha: 1 } // Light blue background
        })
        .png({ quality: 85, compressionLevel: 9 })
        .toFile(outputPath);

      const stats = fs.statSync(outputPath);
      const sizeKB = (stats.size / 1024).toFixed(1);
      console.log(`✅ ${icon.name} (${icon.width}x${icon.height}) - ${sizeKB}KB`);
      successCount++;
    } catch (error) {
      console.error(`❌ Failed to generate ${icon.name}:`, error.message);
      failCount++;
    }
  }

  // Generate publisher logo (wide format with white text on navy background)
  try {
    const logoPath = path.join(publicDir, publisherLogo.name);

    // Create logo with text overlay
    // First, create a solid navy background
    const navyBg = await sharp({
      create: {
        width: publisherLogo.width,
        height: publisherLogo.height,
        channels: 4,
        background: { r: 11, g: 43, b: 84, alpha: 1 } // Navy #0b2b54
      }
    })
    .png()
    .toBuffer();

    // Resize source favicon to fit in left portion (60x60 square)
    const resizedIcon = await sharp(sourceFavicon)
      .resize(50, 50, {
        fit: 'contain',
        background: { r: 11, g: 43, b: 84, alpha: 0 }
      })
      .png()
      .toBuffer();

    // Composite the icon onto the background
    await sharp(navyBg)
      .composite([
        {
          input: resizedIcon,
          left: 5,
          top: 5
        }
      ])
      .png({ quality: 90, compressionLevel: 9 })
      .toFile(logoPath);

    const stats = fs.statSync(logoPath);
    const sizeKB = (stats.size / 1024).toFixed(1);
    console.log(`✅ ${publisherLogo.name} (${publisherLogo.width}x${publisherLogo.height}) - ${sizeKB}KB`);
    console.log('   ℹ️  Note: Logo has icon only. Add "PRTD" text in a design tool for best results.');
    successCount++;
  } catch (error) {
    console.error(`❌ Failed to generate ${publisherLogo.name}:`, error.message);
    failCount++;
  }

  // Optimize the original favicon.png (resize to 512x512 and compress)
  try {
    const optimizedPath = path.join(publicDir, 'favicon-optimized.png');

    await sharp(sourceFavicon)
      .resize(512, 512, {
        fit: 'contain',
        background: { r: 135, g: 206, b: 235, alpha: 1 }
      })
      .png({ quality: 85, compressionLevel: 9 })
      .toFile(optimizedPath);

    const stats = fs.statSync(optimizedPath);
    const sizeKB = (stats.size / 1024).toFixed(1);
    console.log(`\n✅ favicon-optimized.png (512x512) - ${sizeKB}KB`);
    console.log('   ℹ️  Replace favicon.png with this optimized version');
  } catch (error) {
    console.error(`\n❌ Failed to optimize favicon.png:`, error.message);
  }

  // Try to generate optimized .ico file
  try {
    const icoPath = path.join(publicDir, 'favicon-optimized.ico');

    // Sharp doesn't support ICO format, so we'll create a small PNG instead
    await sharp(sourceFavicon)
      .resize(32, 32, {
        fit: 'contain',
        background: { r: 135, g: 206, b: 235, alpha: 1 }
      })
      .png({ quality: 85, compressionLevel: 9 })
      .toFile(icoPath.replace('.ico', '-32.png'));

    console.log('✅ favicon-optimized-32.png - Use this for .ico conversion');
    console.log('   ℹ️  Convert to .ico using: https://convertio.co/png-ico/');
  } catch (error) {
    console.error(`❌ Failed to generate ICO:`, error.message);
  }

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`\n📊 Summary: ${successCount} succeeded, ${failCount} failed\n`);

  if (successCount === iconSizes.length + 1) {
    console.log('✅ All icons generated successfully!\n');
    console.log('📝 Next steps:');
    console.log('   1. Replace public/favicon.png with public/favicon-optimized.png');
    console.log('   2. Convert favicon-optimized-32.png to .ico format');
    console.log('   3. Add "PRTD" text to logo-600x60.png in a design tool\n');
  }
}

// Run the generator
generateIcons().catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});