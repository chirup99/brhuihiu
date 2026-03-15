#!/usr/bin/env bash
# ============================================================
# BRS Connect — Elastic Beanstalk packaging script
# Usage: bash deploy/package-eb.sh
# Output: brs-connect-eb.zip  (ready to upload to EB console)
# ============================================================

set -e

ZIP_NAME="brs-connect-eb.zip"
STAGING_DIR="eb_deploy"

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

# Create port.config (tells EB to use port 8081 + nginx proxy)
cat > "$STAGING_DIR/.ebextensions/port.config" <<EOF
option_settings:
  aws:elasticbeanstalk:application:environment:
    PORT: 8081
  aws:elasticbeanstalk:container:nodejs:
    ProxyServer: nginx
EOF

# Create Procfile
echo "web: npm start" > "$STAGING_DIR/Procfile"

# Copy all required files
cp -r dist          "$STAGING_DIR/"
cp -r server        "$STAGING_DIR/"
cp -r shared        "$STAGING_DIR/"
cp package.json     "$STAGING_DIR/"
cp package-lock.json "$STAGING_DIR/"

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
