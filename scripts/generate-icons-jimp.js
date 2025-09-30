#!/usr/bin/env node

/**
 * Generate optimized favicons and icons using Jimp (pure JavaScript)
 * Resizes and optimizes the source favicon to multiple sizes
 */

const { Jimp } = require('jimp');
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'public');
const sourceFavicon = path.join(publicDir, 'favicon.png');

// Icon sizes to generate
const iconSizes = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
];

// Publisher logo dimensions (wide format)
const publisherLogo = {
  name: 'logo-600x60.png',
  width: 600,
  height: 60
};

async function generateIcons() {
  console.log('🎨 Generating optimized icons with Jimp...\n');

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

  // Load source image once
  let sourceImage;
  try {
    sourceImage = await Jimp.read(sourceFavicon);
    console.log(`✓ Loaded source image: ${sourceImage.bitmap.width}x${sourceImage.bitmap.height}\n`);
  } catch (error) {
    console.error('❌ Failed to load source image:', error.message);
    process.exit(1);
  }

  // Generate square icons
  for (const icon of iconSizes) {
    try {
      const outputPath = path.join(publicDir, icon.name);

      const resized = await sourceImage.clone().contain({ w: icon.size, h: icon.size });

      await resized.write(outputPath);

      const stats = fs.statSync(outputPath);
      const sizeKB = (stats.size / 1024).toFixed(1);
      console.log(`✅ ${icon.name} (${icon.size}x${icon.size}) - ${sizeKB}KB`);
      successCount++;
    } catch (error) {
      console.error(`❌ Failed to generate ${icon.name}:`, error.message);
      failCount++;
    }
  }

  // Generate publisher logo (wide format with navy background)
  try {
    const logoPath = path.join(publicDir, publisherLogo.name);

    // Create navy background
    const logo = new Jimp({ width: publisherLogo.width, height: publisherLogo.height, color: 0x0b2b54ff }); // Navy #0b2b54

    // Resize source icon to fit in left portion (50x50)
    const iconForLogo = await sourceImage.clone().contain({ w: 50, h: 50 });

    // Composite icon onto background
    await logo.composite(iconForLogo, 5, 5);

    // Add text "PRTD" if possible (Jimp has limited font support)
    try {
      const font = await Jimp.loadFont('FONT_SANS_32_WHITE');
      await logo.print({ font, x: 70, y: 14, text: 'PRTD' });
    } catch (e) {
      console.log('   ℹ️  Could not add text. Add "PRTD" manually in a design tool.');
    }

    await logo.write(logoPath);

    const stats = fs.statSync(logoPath);
    const sizeKB = (stats.size / 1024).toFixed(1);
    console.log(`\n✅ ${publisherLogo.name} (${publisherLogo.width}x${publisherLogo.height}) - ${sizeKB}KB`);
    successCount++;
  } catch (error) {
    console.error(`\n❌ Failed to generate ${publisherLogo.name}:`, error.message);
    failCount++;
  }

  // Optimize the original favicon.png (resize to 512x512 and compress)
  try {
    const optimizedPath = path.join(publicDir, 'favicon-optimized.png');

    const optimized = await sourceImage.clone().contain({ w: 512, h: 512 });

    await optimized.write(optimizedPath);

    const stats = fs.statSync(optimizedPath);
    const sizeKB = (stats.size / 1024).toFixed(1);
    console.log(`\n✅ favicon-optimized.png (512x512) - ${sizeKB}KB`);
    console.log(`   💡 This can replace favicon.png (reduces from ~1MB to ~${sizeKB}KB)`);
  } catch (error) {
    console.error(`\n❌ Failed to optimize favicon.png:`, error.message);
  }

  // Generate small version for .ico conversion
  try {
    const ico32Path = path.join(publicDir, 'favicon-32-for-ico.png');

    const small = await sourceImage.clone().contain({ w: 32, h: 32 });

    await small.write(ico32Path);

    console.log('✅ favicon-32-for-ico.png - Use this for .ico conversion');
    console.log('   🔗 Convert to .ico: https://convertio.co/png-ico/');
  } catch (error) {
    console.error(`❌ Failed to generate ICO source:`, error.message);
  }

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`\n📊 Summary: ${successCount} succeeded, ${failCount} failed\n`);

  if (successCount >= iconSizes.length) {
    console.log('✅ All required icons generated successfully!\n');
    console.log('📝 Next steps:');
    console.log('   1. ✅ All PWA icons ready (favicon-16x16.png, favicon-32x32.png, etc.)');
    console.log('   2. ✅ Publisher logo created (logo-600x60.png)');
    console.log('   3. 💡 Optional: Replace favicon.png with favicon-optimized.png');
    console.log('   4. 💡 Optional: Add better text to logo-600x60.png in Figma/Canva\n');
  }

  // List all generated files
  console.log('📂 Generated files in public/:');
  const allFiles = [
    ...iconSizes.map(i => i.name),
    publisherLogo.name,
    'favicon-optimized.png',
    'favicon-32-for-ico.png'
  ];

  allFiles.forEach(fileName => {
    const filePath = path.join(publicDir, fileName);
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      const sizeKB = (stats.size / 1024).toFixed(1);
      console.log(`   ✓ ${fileName} (${sizeKB}KB)`);
    }
  });

  console.log('');
}

// Run the generator
generateIcons().catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});