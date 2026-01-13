#!/bin/bash
# Upload assets to S3-compatible storage
# Only uploads files that don't already exist in the bucket (by size comparison)
#
# Usage: ./scripts/upload-assets.sh
#
# Required environment variables (in .env):
#   VITE_BUCKET_NAME, VITE_BUCKET_ACCESS_KEY_ID, VITE_BUCKET_SECRET_ACCESS_KEY, VITE_BUCKET_ENDPOINT

set -e

# Get script directory and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Change to project root
cd "$PROJECT_ROOT"

# Load .env if it exists
if [ -f .env ]; then
    set -a
    source .env
    set +a
fi

# Check required env vars
if [ -z "$VITE_BUCKET_NAME" ] || [ -z "$VITE_BUCKET_ACCESS_KEY" ] || [ -z "$VITE_BUCKET_SECRET_ACCESS_KEY" ] || [ -z "$VITE_BUCKET_ENDPOINT" ]; then
    echo "Error: Missing required environment variables"
    echo "Required: VITE_BUCKET_NAME, VITE_BUCKET_ACCESS_KEY, VITE_BUCKET_SECRET_ACCESS_KEY, VITE_BUCKET_ENDPOINT"
    exit 1
fi

BUCKET_REGION="${VITE_BUCKET_REGION:-auto}"

# Configure AWS CLI for S3-compatible endpoint
export AWS_ACCESS_KEY_ID="$VITE_BUCKET_ACCESS_KEY"
export AWS_SECRET_ACCESS_KEY="$VITE_BUCKET_SECRET_ACCESS_KEY"
export AWS_DEFAULT_REGION="$BUCKET_REGION"

# Source directory
SOURCE_DIR="public"
# Destination prefix in S3
DEST_PREFIX="desk"

echo "Scanning $SOURCE_DIR for assets..."
echo "Uploading to s3://$VITE_BUCKET_NAME/$DEST_PREFIX/"
echo ""

uploaded=0
skipped=0

# Find all matching files (macOS compatible)
find "$SOURCE_DIR" -type f \( -name "*.glb" -o -name "*.gltf" -o -name "*.bin" -o -name "*.mp3" -o -name "*.mp4" -o -name "*.mov" \) | while read -r file; do
    # Get relative path from SOURCE_DIR
    rel_path="${file#$SOURCE_DIR/}"
    s3_key="$DEST_PREFIX/$rel_path"
    
    # Get local file size
    local_size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null)
    
    # Check if file exists in S3 and get its size
    remote_info=$(aws s3api head-object \
        --bucket "$VITE_BUCKET_NAME" \
        --key "$s3_key" \
        --endpoint-url "$VITE_BUCKET_ENDPOINT" \
        2>/dev/null || echo "NOT_FOUND")
    
    if [ "$remote_info" = "NOT_FOUND" ]; then
        # File doesn't exist, upload it
        echo "Uploading: $rel_path"
        aws s3 cp "$file" "s3://$VITE_BUCKET_NAME/$s3_key" \
            --endpoint-url "$VITE_BUCKET_ENDPOINT" \
            --acl public-read \
            --quiet
        ((uploaded++)) || true
    else
        # Check if sizes match
        remote_size=$(echo "$remote_info" | grep -o '"ContentLength": [0-9]*' | grep -o '[0-9]*')
        if [ "$local_size" = "$remote_size" ]; then
            echo "Skipping (exists): $rel_path"
            ((skipped++)) || true
        else
            echo "Uploading (size changed): $rel_path"
            aws s3 cp "$file" "s3://$VITE_BUCKET_NAME/$s3_key" \
                --endpoint-url "$VITE_BUCKET_ENDPOINT" \
                --acl public-read \
                --quiet
            ((uploaded++)) || true
        fi
    fi
done

echo ""
echo "Done! Uploaded: $uploaded, Skipped: $skipped"

