#!/bin/bash

# Beach Image Compression Script (bash version - no dependencies)
# Compresses existing uploaded images using ImageMagick or similar tools

set -euo pipefail

# Configuration
UPLOAD_DIR="public/images/uploads"
BACKUP_DIR="public/images/uploads-backup-$(date +%s)"
MAX_WIDTH=1200
MAX_HEIGHT=675
QUALITY=85
DRY_RUN=false
CREATE_BACKUP=false
FORCE=false

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Stats
TOTAL_IMAGES=0
PROCESSED=0
SKIPPED=0
FAILED=0
ORIGINAL_SIZE=0
COMPRESSED_SIZE=0

print_usage() {
    cat << EOF
🖼️  Beach Image Compression Tool

Usage: $0 [OPTIONS]

Options:
    --dry-run           Preview changes without modifying files
    --backup            Create backups before compression
    --force             Recompress even if already optimized
    -h, --help          Show this help message

Examples:
    $0 --dry-run                    # Preview compression
    $0 --backup                     # Compress with backups
    $0                              # Compress images (no backup)

EOF
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --backup)
            CREATE_BACKUP=true
            shift
            ;;
        --force)
            FORCE=true
            shift
            ;;
        -h|--help)
            print_usage
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            print_usage
            exit 1
            ;;
    esac
done

# Check if ImageMagick is installed
check_dependencies() {
    if ! command -v convert &> /dev/null && ! command -v magick &> /dev/null; then
        echo -e "${RED}❌ ImageMagick not found${NC}"
        echo ""
        echo "Please install ImageMagick:"
        echo "  Ubuntu/Debian: sudo apt-get install imagemagick"
        echo "  CentOS/RHEL:   sudo yum install ImageMagick"
        echo "  macOS:         brew install imagemagick"
        exit 1
    fi
}

# Get file size in bytes
get_file_size() {
    local file="$1"
    if [[ -f "$file" ]]; then
        stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null || echo "0"
    else
        echo "0"
    fi
}

# Format bytes to human readable
format_bytes() {
    local bytes=$1
    if (( bytes < 1024 )); then
        echo "${bytes}B"
    elif (( bytes < 1048576 )); then
        echo "$((bytes / 1024))KB"
    else
        echo "$((bytes / 1048576))MB"
    fi
}

# Compress a single image
compress_image() {
    local file="$1"
    local filename=$(basename "$file")
    local original_size=$(get_file_size "$file")

    # Skip if file is already small and properly sized (unless force mode)
    if [[ "$FORCE" != "true" ]] && (( original_size < 204800 )); then
        # Check dimensions
        local width=$(identify -format "%w" "$file" 2>/dev/null || echo "9999")
        if (( width <= MAX_WIDTH )); then
            echo -e "  ${YELLOW}⏭️  Skipped${NC} (already optimized)"
            ((SKIPPED++)) || true
            return 0
        fi
    fi

    # Create backup if requested
    if [[ "$CREATE_BACKUP" == "true" ]] && [[ "$DRY_RUN" != "true" ]]; then
        mkdir -p "$(dirname "$BACKUP_DIR/$filename")"
        cp "$file" "$BACKUP_DIR/$filename"
    fi

    # Compress to temporary file
    local temp_file="${file}.tmp"

    if command -v magick &> /dev/null; then
        # Modern ImageMagick 7+
        magick "$file" \
            -resize "${MAX_WIDTH}x${MAX_HEIGHT}>" \
            -quality $QUALITY \
            -strip \
            -interlace Plane \
            "$temp_file" 2>/dev/null || {
                echo -e "  ${RED}❌ Failed${NC}: magick command error"
                ((FAILED++)) || true
                return 1
            }
    else
        # ImageMagick 6
        convert "$file" \
            -resize "${MAX_WIDTH}x${MAX_HEIGHT}>" \
            -quality $QUALITY \
            -strip \
            -interlace Plane \
            "$temp_file" 2>/dev/null || {
                echo -e "  ${RED}❌ Failed${NC}: convert command error"
                ((FAILED++)) || true
                return 1
            }
    fi

    if [[ ! -f "$temp_file" ]]; then
        echo -e "  ${RED}❌ Failed${NC}: temp file not created"
        ((FAILED++)) || true
        return 1
    fi

    local compressed_size=$(get_file_size "$temp_file")

    # Only replace if smaller
    if (( compressed_size < original_size )); then
        local saved=$((original_size - compressed_size))
        local percent=$((saved * 100 / original_size))

        if [[ "$DRY_RUN" == "true" ]]; then
            echo -e "  ${GREEN}✅ Would compress${NC}: $(format_bytes $original_size) → $(format_bytes $compressed_size) (${percent}% saved)"
            rm -f "$temp_file"
        else
            mv "$temp_file" "$file"
            chmod 644 "$file"
            echo -e "  ${GREEN}✅ Compressed${NC}: $(format_bytes $original_size) → $(format_bytes $compressed_size) (${percent}% saved)"
        fi

        ((PROCESSED++)) || true
        ORIGINAL_SIZE=$((ORIGINAL_SIZE + original_size))
        COMPRESSED_SIZE=$((COMPRESSED_SIZE + compressed_size))
    else
        echo -e "  ${YELLOW}⏭️  Skipped${NC} (compressed version larger)"
        rm -f "$temp_file"
        ((SKIPPED++)) || true
        ORIGINAL_SIZE=$((ORIGINAL_SIZE + original_size))
        COMPRESSED_SIZE=$((COMPRESSED_SIZE + original_size))
    fi
}

# Main processing
main() {
    check_dependencies

    echo -e "${BLUE}🖼️  Beach Image Compression Tool${NC}"
    echo ""
    echo "📁 Upload directory: $UPLOAD_DIR"
    echo "⚙️  Settings:"
    echo "   - Max dimensions: ${MAX_WIDTH}x${MAX_HEIGHT}px"
    echo "   - Quality: ${QUALITY}%"
    echo "   - Dry run: $([ "$DRY_RUN" = true ] && echo "YES" || echo "NO")"
    echo "   - Force recompression: $([ "$FORCE" = true ] && echo "YES" || echo "NO")"
    echo "   - Create backups: $([ "$CREATE_BACKUP" = true ] && echo "YES" || echo "NO")"
    echo ""

    if [[ "$DRY_RUN" == "true" ]]; then
        echo -e "${YELLOW}🧪 DRY RUN MODE - No files will be modified${NC}"
        echo ""
    fi

    # Find all images
    echo "🔍 Scanning for images..."

    local image_files=()
    while IFS= read -r -d '' file; do
        image_files+=("$file")
    done < <(find "$UPLOAD_DIR" -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o -iname "*.webp" \) -print0 2>/dev/null)

    TOTAL_IMAGES=${#image_files[@]}

    if (( TOTAL_IMAGES == 0 )); then
        echo -e "${YELLOW}⚠️  No images found in $UPLOAD_DIR${NC}"
        exit 0
    fi

    echo -e "${GREEN}📸 Found $TOTAL_IMAGES images${NC}"
    echo ""

    # Create backup directory if needed
    if [[ "$CREATE_BACKUP" == "true" ]] && [[ "$DRY_RUN" != "true" ]]; then
        mkdir -p "$BACKUP_DIR"
        echo -e "💾 Backups will be saved to: ${BACKUP_DIR}"
        echo ""
    fi

    # Process each image
    local start_time=$(date +%s)
    local counter=0

    for file in "${image_files[@]}"; do
        ((counter++)) || true
        local filename=$(basename "$file")
        echo -e "${BLUE}[$counter/$TOTAL_IMAGES]${NC} Processing: $filename"
        compress_image "$file"
        echo ""
    done

    local end_time=$(date +%s)
    local duration=$((end_time - start_time))

    # Print summary
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "${BLUE}📊 COMPRESSION SUMMARY${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "${GREEN}✅ Processed:${NC}     $PROCESSED images"
    echo -e "${YELLOW}⏭️  Skipped:${NC}       $SKIPPED images"
    echo -e "${RED}❌ Failed:${NC}        $FAILED images"
    echo -e "⏱️  Time:          ${duration}s"
    echo ""
    echo "📦 Original size:  $(format_bytes $ORIGINAL_SIZE)"
    echo "📦 Compressed:     $(format_bytes $COMPRESSED_SIZE)"

    local saved=$((ORIGINAL_SIZE - COMPRESSED_SIZE))
    local percent=0
    if (( ORIGINAL_SIZE > 0 )); then
        percent=$((saved * 100 / ORIGINAL_SIZE))
    fi

    echo -e "${GREEN}💾 Space saved:    $(format_bytes $saved) (${percent}%)${NC}"
    echo ""

    if [[ "$DRY_RUN" == "true" ]]; then
        echo -e "${YELLOW}💡 This was a dry run. Run without --dry-run to compress images.${NC}"
    elif [[ "$CREATE_BACKUP" == "true" ]]; then
        echo -e "💾 Original images backed up to: ${BACKUP_DIR}"
    fi
}

main
