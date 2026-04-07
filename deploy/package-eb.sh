#!/usr/bin/env bash
# ============================================================
# BRS Connect — Elastic Beanstalk packaging script
# Usage: bash deploy/package-eb.sh [optional-zip-name]
# Output: brs-connect-eb.zip  (or the name you pass in)
# ============================================================

set -e

ZIP_NAME="${1:-brs-connect-eb.zip}"

echo ""
echo "=== BRS Connect — EB Package Builder ==="
echo ""

# 1. Build the project
# Runs Vite to build the frontend and esbuild to bundle the server into dist/index.cjs
echo "[1/8] Building project..."
npm run build

# 2. Create a temporary staging directory
echo "[2/8] Creating staging directory..."
rm -rf eb_deploy
mkdir -p eb_deploy/.ebextensions

# 3. Create the AWS Port Configuration
# This tells AWS to route traffic to port 8081
echo "[3/8] Creating port config..."
cat > eb_deploy/.ebextensions/port.config <<EOF
option_settings:
  aws:elasticbeanstalk:application:environment:
    PORT: 8081
  aws:elasticbeanstalk:container:nodejs:
    ProxyServer: nginx
EOF

# 4. Create the Procfile
# This tells AWS exactly how to start the application
echo "[4/8] Creating Procfile..."
echo "web: npm start" > eb_deploy/Procfile

# 5. Create the production .env file
# Replace the values below with your actual credentials before deploying
echo "[5/8] Creating .env template..."
cat > eb_deploy/.env <<EOF
PORT=8081
NODE_ENV=production
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
DYNAMODB_TABLE_NAME=Users
EOF

# 6. Copy all required files into the staging area
# dist/ contains the compiled frontend and the fully bundled server (dist/index.cjs).
# server/ and shared/ are included so any runtime path resolutions stay intact.
# package.json is written as a minimal file — the full package.json must NOT be
# copied because EB would run "npm install" on all ~73 packages (AWS SDK, etc.)
# causing a 15-minute timeout. Everything is already bundled inside dist/index.cjs.
# Only bufferutil (native addon, cannot be bundled) is listed so EB installs its
# prebuilt binary in ~2 seconds.
echo "[6/8] Copying files..."
cp -r dist          eb_deploy/
cp -r server        eb_deploy/
cp -r shared        eb_deploy/
cp package-lock.json eb_deploy/
cat > eb_deploy/package.json <<'PKGJSON'
{
  "name": "brs-connect",
  "version": "1.0.0",
  "scripts": {
    "start": "node dist/index.cjs"
  },
  "optionalDependencies": {
    "bufferutil": "^4.1.0"
  }
}
PKGJSON

# 7. Generate the ZIP file
# Move into the folder so the ZIP has no top-level wrapper folder
echo "[7/8] Generating ZIP: $ZIP_NAME"
rm -f "$ZIP_NAME"
cd eb_deploy && zip -r "../$ZIP_NAME" . --quiet && cd ..

# 8. Clean up
echo "[8/8] Cleaning up..."
rm -rf eb_deploy

SIZE=$(du -sh "$ZIP_NAME" | cut -f1)
echo ""
echo "Done! Package ready: $ZIP_NAME ($SIZE)"
echo ""
echo "IMPORTANT: Edit the .env values inside the ZIP before uploading."
echo "Next step: Upload $ZIP_NAME to Elastic Beanstalk"
echo "  EB Console → brs-connect-prod-v4 → Upload and deploy → choose $ZIP_NAME"
echo ""
