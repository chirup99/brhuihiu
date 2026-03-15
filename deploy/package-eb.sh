#!/usr/bin/env bash
# ============================================================
# BRS Connect — Elastic Beanstalk packaging script
# Usage: bash deploy/package-eb.sh [optional-zip-name]
# Output: brs-connect-eb.zip  (or the name you pass in)
# ============================================================
#
# ZIP structure (what EB receives):
#   .ebextensions/port.config  — routes traffic to PORT 8081 via nginx
#   Procfile                   — tells EB to run: npm start → node dist/index.cjs
#   dist/                      — compiled frontend + fully self-contained server bundle
#   package.json               — MINIMAL: only bufferutil (native addon, can't be bundled)
#
# Why a MINIMAL package.json (not the full one):
#   dist/index.cjs is a self-contained esbuild bundle that already includes
#   bcryptjs, the entire AWS SDK, express, and every other JS dependency.
#   Copying the full package.json causes EB to run "npm install" and download
#   hundreds of MB of packages that are already in the bundle — this hits the
#   EB 15-minute command timeout and causes the "None of the instances are
#   sending data" deployment failure.
#
#   Only bufferutil is excluded from the bundle (it is a native C++ addon).
#   It ships prebuilt binaries, so EB installs it in seconds with no compilation.
#   If bufferutil is unavailable, ws (WebSocket) falls back gracefully.
#
#   Native bcrypt is NOT used. The app uses only bcryptjs (pure-JS, bundled).
# ============================================================

set -e

ZIP_NAME="${1:-brs-connect-eb.zip}"
STAGING_DIR="eb_deploy"

echo ""
echo "=== BRS Connect — EB Package Builder ==="
echo ""

# ── 1. Build ────────────────────────────────────────────────
echo "[1/4] Building application..."
npm run build

# ── 2. Staging directory ────────────────────────────────────
echo "[2/4] Assembling package..."
rm -rf "$STAGING_DIR"
mkdir -p "$STAGING_DIR/.ebextensions"

# ── 3. Config files ─────────────────────────────────────────
# Port config: route EB traffic → port 8081 via nginx
cat > "$STAGING_DIR/.ebextensions/port.config" <<EOF
option_settings:
  aws:elasticbeanstalk:application:environment:
    PORT: 8081
  aws:elasticbeanstalk:container:nodejs:
    ProxyServer: nginx
EOF

# Procfile: tell EB how to start the app
echo "web: npm start" > "$STAGING_DIR/Procfile"

# ── 4. Runtime files ─────────────────────────────────────────
# dist/ is the ONLY folder needed — it contains:
#   dist/public/    → compiled React frontend
#   dist/index.cjs  → fully bundled Express server (bcryptjs + AWS SDK + all deps inside)
cp -r dist "$STAGING_DIR/"

# Minimal package.json — EB requires this file for the start script.
# bufferutil is listed as optional so EB installs its prebuilt binary
# (takes ~2 seconds). Everything else is already inside dist/index.cjs.
cat > "$STAGING_DIR/package.json" <<'EOF'
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
EOF

# ── 5. ZIP ──────────────────────────────────────────────────
echo "[3/4] Creating ZIP: $ZIP_NAME"
rm -f "$ZIP_NAME"
cd "$STAGING_DIR" && zip -r "../$ZIP_NAME" . --quiet && cd ..
rm -rf "$STAGING_DIR"

# ── 6. Confirm ──────────────────────────────────────────────
SIZE=$(du -sh "$ZIP_NAME" | cut -f1)
echo "[4/4] Done! Package ready: $ZIP_NAME ($SIZE)"
echo ""
echo "What EB will do on deploy:"
echo "  npm install   → installs only bufferutil (~2 seconds, prebuilt binary)"
echo "  npm start     → node dist/index.cjs  (self-contained, no extra deps needed)"
echo ""
echo "Bundled inside dist/index.cjs: bcryptjs, AWS SDK, express, all JS deps"
echo "Native bcrypt  : NOT present — bcryptjs (pure-JS) is used throughout"
echo ""
echo "Next step: Upload $ZIP_NAME to Elastic Beanstalk"
echo "  EB Console → brs-connect-prod-v2 → Upload and deploy → choose $ZIP_NAME"
echo ""
