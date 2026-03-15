#!/usr/bin/env bash
# ============================================================
# BRS Connect — Elastic Beanstalk packaging script
# Usage: bash deploy/package-eb.sh
# Output: brs-connect-eb.zip  (ready to upload to EB console)
# ============================================================

set -e

ZIP_NAME="brs-connect-eb.zip"
STAGING_DIR="_eb_staging"

echo ""
echo "=== BRS Connect — EB Package Builder ==="
echo ""

# 1. Build
echo "[1/4] Building application..."
npm run build

# 2. Create staging directory
echo "[2/4] Assembling package..."
rm -rf "$STAGING_DIR"
mkdir -p "$STAGING_DIR/.ebextensions"

# Copy build output
cp -r dist              "$STAGING_DIR/"
cp package.json         "$STAGING_DIR/"
cp package-lock.json    "$STAGING_DIR/"
cp Procfile             "$STAGING_DIR/"
cp .ebextensions/nodeport.config "$STAGING_DIR/.ebextensions/nodeport.config"

# 3. Zip
echo "[3/4] Creating ZIP: $ZIP_NAME"
rm -f "$ZIP_NAME"
cd "$STAGING_DIR" && zip -r "../$ZIP_NAME" . --quiet && cd ..
rm -rf "$STAGING_DIR"

# 4. Confirm
SIZE=$(du -sh "$ZIP_NAME" | cut -f1)
echo "[4/4] Done! Package ready: $ZIP_NAME ($SIZE)"
echo ""
echo "Next step: Upload $ZIP_NAME to Elastic Beanstalk"
echo "  EB Console → brs-connect-prod-v2 → Upload and deploy → choose $ZIP_NAME"
echo ""
