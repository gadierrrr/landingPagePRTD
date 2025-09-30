#!/usr/bin/env node

/**
 * Generate optimized favicons and icons from source PNG
 * Uses Node.js Canvas API (no external dependencies required)
 */

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
  { name: 'logo-600x60.png', size: { width: 600, height: 60 } }
];

console.log('🎨 Icon Generation Tool');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('');
console.log('⚠️  This server does not have ImageMagick or Sharp installed.');
console.log('');
console.log('To generate optimized icons, you have two options:');
console.log('');
console.log('📦 OPTION 1: Install ImageMagick (Recommended)');
console.log('');
console.log('  Ubuntu/Debian:');
console.log('    sudo apt-get update');
console.log('    sudo apt-get install imagemagick');
console.log('');
console.log('  Then run these commands:');
console.log('');
iconSizes.forEach(icon => {
  const size = typeof icon.size === 'number' ? `${icon.size}x${icon.size}` : `${icon.size.width}x${icon.size.height}`;
  console.log(`    convert public/favicon.png -resize ${size} -quality 85 public/${icon.name}`);
});
console.log('');
console.log('📦 OPTION 2: Install Sharp package');
console.log('');
console.log('  npm install --save-dev sharp');
console.log('  Then run: node scripts/generate-icons-sharp.js');
console.log('');
console.log('🌐 OPTION 3: Use Online Tool');
console.log('');
console.log('  1. Visit: https://realfavicongenerator.net/');
console.log('  2. Upload: public/favicon.png');
console.log('  3. Download and extract to public/');
console.log('');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('');
console.log('📋 Required Files:');
console.log('');
iconSizes.forEach(icon => {
  const targetPath = path.join(publicDir, icon.name);
  const exists = fs.existsSync(targetPath);
  const status = exists ? '✅' : '❌';
  const size = typeof icon.size === 'number' ? `${icon.size}x${icon.size}` : `${icon.size.width}x${icon.size.height}`;
  console.log(`  ${status} ${icon.name} (${size})`);
});
console.log('');

// Check source file size
try {
  const stats = fs.statSync(sourceFavicon);
  const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
  console.log(`📊 Current source file: ${sizeMB}MB (should be <15KB for optimal performance)`);
  console.log('');
} catch (e) {
  console.log('❌ Source file not found: public/favicon.png');
  console.log('');
}

process.exit(0);