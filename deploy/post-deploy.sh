#!/bin/bash
set -e

echo "Running post-deployment optimizations..."

# Navigate to project directory
cd /home/deploy/prtd

# Optimize any new images
echo "Processing uploaded images..."
npm run images:process

# Clear Next.js image cache
echo "Clearing Next.js image cache..."
rm -rf .next/cache/images

# Restart service
echo "Restarting prtd service..."
sudo systemctl restart prtd

echo "✓ Optimizations complete!"
echo "Visit https://puertoricotraveldeals.com to verify deployment"