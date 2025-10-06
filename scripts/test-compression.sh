#!/bin/bash

# Test image compression function
TEST_IMAGE="/tmp/test-beach-large.jpg"
MAX_DIMENSIONS="800x600"
QUALITY=85
TEMP_PATH="${TEST_IMAGE}.tmp"

echo "Testing ImageMagick compression..."
echo "Original image:"
ls -lh "$TEST_IMAGE" | awk '{print "  Size: " $5}'
file "$TEST_IMAGE" | sed 's/.*: /  Format: /'

echo ""
echo "Compressing to ${MAX_DIMENSIONS} at quality ${QUALITY}..."

convert "$TEST_IMAGE" \
  -resize "${MAX_DIMENSIONS}>" \
  -quality ${QUALITY} \
  -strip \
  "$TEMP_PATH"

echo ""
echo "Compressed image:"
ls -lh "$TEMP_PATH" | awk '{print "  Size: " $5}'
file "$TEMP_PATH" | sed 's/.*: /  Format: /'

echo ""
ORIG_SIZE=$(stat -c%s "$TEST_IMAGE")
COMP_SIZE=$(stat -c%s "$TEMP_PATH")
SAVED=$((ORIG_SIZE - COMP_SIZE))
PERCENT=$((SAVED * 100 / ORIG_SIZE))

echo "Result: Saved $PERCENT% ($(($SAVED / 1024))KB smaller)"
echo ""
echo "Compressed file: $TEMP_PATH"
