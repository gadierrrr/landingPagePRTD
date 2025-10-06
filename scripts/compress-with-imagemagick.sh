#!/bin/bash

# Image compression script using ImageMagick
# Compresses images >500KB to max 200KB with quality 85

UPLOAD_DIR="public/images/uploads"
BACKUP_DIR="public/images/uploads-backup-$(date +%s)"
MAX_SIZE=500k
TARGET_QUALITY=85
MAX_WIDTH=1200
MAX_HEIGHT=675

echo "🖼️  Beach Image Compression (ImageMagick)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📁 Upload directory: $UPLOAD_DIR"
echo "💾 Backup directory: $BACKUP_DIR"
echo "⚙️  Settings:"
echo "   - Max dimensions: ${MAX_WIDTH}x${MAX_HEIGHT}px"
echo "   - Quality: ${TARGET_QUALITY}%"
echo ""

# Create backup directory
mkdir -p "$BACKUP_DIR"
echo "✅ Created backup directory"
echo ""

# Find images larger than 500KB
LARGE_IMAGES=$(find "$UPLOAD_DIR" -type f \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" -o -name "*.webp" \) -size +${MAX_SIZE})

if [ -z "$LARGE_IMAGES" ]; then
    echo "✨ No images larger than 500KB found"
    exit 0
fi

TOTAL_IMAGES=$(echo "$LARGE_IMAGES" | wc -l)
echo "📸 Found $TOTAL_IMAGES images to compress"
echo ""

PROCESSED=0
SKIPPED=0
TOTAL_ORIGINAL=0
TOTAL_COMPRESSED=0

while IFS= read -r IMAGE; do
    PROCESSED=$((PROCESSED + 1))
    FILENAME=$(basename "$IMAGE")

    echo "[$PROCESSED/$TOTAL_IMAGES] Processing: $FILENAME"

    # Get original size
    ORIGINAL_SIZE=$(stat -f%z "$IMAGE" 2>/dev/null || stat -c%s "$IMAGE" 2>/dev/null)
    TOTAL_ORIGINAL=$((TOTAL_ORIGINAL + ORIGINAL_SIZE))

    # Backup original
    cp "$IMAGE" "$BACKUP_DIR/$FILENAME"

    # Compress image
    TMP_FILE="${IMAGE}.tmp"

    convert "$IMAGE" \
        -resize "${MAX_WIDTH}x${MAX_HEIGHT}>" \
        -quality ${TARGET_QUALITY} \
        -strip \
        "$TMP_FILE"

    if [ $? -eq 0 ]; then
        # Check compressed size
        COMPRESSED_SIZE=$(stat -f%z "$TMP_FILE" 2>/dev/null || stat -c%s "$TMP_FILE" 2>/dev/null)

        # Only replace if smaller
        if [ $COMPRESSED_SIZE -lt $ORIGINAL_SIZE ]; then
            mv "$TMP_FILE" "$IMAGE"
            chmod 644 "$IMAGE"

            TOTAL_COMPRESSED=$((TOTAL_COMPRESSED + COMPRESSED_SIZE))

            SAVED=$((ORIGINAL_SIZE - COMPRESSED_SIZE))
            PERCENT=$((SAVED * 100 / ORIGINAL_SIZE))

            ORIG_KB=$((ORIGINAL_SIZE / 1024))
            COMP_KB=$((COMPRESSED_SIZE / 1024))

            echo "  ✅ ${ORIG_KB}KB → ${COMP_KB}KB (saved ${PERCENT}%)"
        else
            rm "$TMP_FILE"
            TOTAL_COMPRESSED=$((TOTAL_COMPRESSED + ORIGINAL_SIZE))
            echo "  ⏭️  Skipped (compressed version larger)"
        fi
    else
        echo "  ❌ Failed to compress"
        rm -f "$TMP_FILE"
        TOTAL_COMPRESSED=$((TOTAL_COMPRESSED + ORIGINAL_SIZE))
    fi

    echo ""
done <<< "$LARGE_IMAGES"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 COMPRESSION SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Processed: $PROCESSED images"

ORIG_MB=$((TOTAL_ORIGINAL / 1024 / 1024))
COMP_MB=$((TOTAL_COMPRESSED / 1024 / 1024))
SAVED=$((TOTAL_ORIGINAL - TOTAL_COMPRESSED))
SAVED_KB=$((SAVED / 1024))
PERCENT_SAVED=$((SAVED * 100 / TOTAL_ORIGINAL))

echo "📦 Original size:  ${ORIG_MB}MB"
echo "📦 Compressed:     ${COMP_MB}MB"
echo "💾 Space saved:    ${SAVED_KB}KB (${PERCENT_SAVED}%)"
echo ""
echo "💾 Original images backed up to: $BACKUP_DIR"
