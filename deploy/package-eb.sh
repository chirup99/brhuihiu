#!/usr/bin/env bash
# ============================================================
# BRS Connect — Elastic Beanstalk packaging script
# Usage: bash deploy/package-eb.sh [optional-zip-name]
# Output: brs-connect-eb.zip  (or the name you pass in)
# ============================================================
#
# ZIP structure (what EB receives):
#   .ebextensions/port.config  — routes traffic to PORT 8081 via nginx
#   Procfile                   — tells EB to run: npm start
#   dist/                      — compiled frontend + bundled server (dist/index.cjs)
#   server/                    — source included for any dynamic imports
#   shared/                    — shared types/schema used at runtime
#   package.json               — CLEANED: only real runtime deps, no @types/* packages
#   package-lock.json          — lockfile so EB installs exact versions
#
# Why we strip @types/* from package.json:
#   The source package.json contains "@types/bcrypt" (types for the NATIVE
#   bcrypt C++ addon) inside "dependencies" by mistake. At runtime this is
#   harmless as a package, BUT some EB Node.js platform versions resolve it
#   as a peer hint and attempt to compile native bcrypt alongside bcryptjs,
#   causing deployment failures. All @types/* entries are compile-time only
#   and have zero runtime value — so we remove them from the ZIP's
#   package.json. bcryptjs (pure-JS, no native bindings) stays in place.
# ============================================================

set -e

ZIP_NAME="${1:-brs-connect-eb.zip}"
STAGING_DIR="eb_deploy"

echo ""
echo "=== BRS Connect — EB Package Builder ==="
echo ""

# ── 1. Build ────────────────────────────────────────────────
echo "[1/5] Building application..."
npm run build

# ── 2. Staging directory ────────────────────────────────────
echo "[2/5] Assembling package..."
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

# ── 4. Copy required files ──────────────────────────────────
# dist/   — compiled frontend assets + bundled server (dist/index.cjs)
cp -r dist          "$STAGING_DIR/"

# server/ & shared/ — included so any dynamic require() paths that resolve
# relative to the project root (e.g. secondary processes) still work.
cp -r server        "$STAGING_DIR/"
cp -r shared        "$STAGING_DIR/"

# package-lock.json — ensures EB installs the exact same dep versions
cp package-lock.json "$STAGING_DIR/"

# ── 5. Generate a CLEAN package.json ────────────────────────
# We do NOT copy package.json directly.
# Instead we use Node to strip every "@types/*" entry out of
# "dependencies" before writing the file into the ZIP.
#
# Why: "@types/bcrypt" (native bcrypt types) sits in "dependencies"
# in the source repo. On EB, npm install sees it and can trigger
# native bcrypt compilation. bcryptjs (pure-JS) is used by the app
# and must remain. All other @types/* have no runtime value either.
echo "  → Stripping @types/* from dependencies for production..."
node -e "
const pkg = JSON.parse(require('fs').readFileSync('package.json', 'utf8'));

// Remove all @types/* from dependencies — they are compile-time only.
// This specifically removes @types/bcrypt which can cause EB to attempt
// native bcrypt compilation instead of using bcryptjs.
if (pkg.dependencies) {
  for (const key of Object.keys(pkg.dependencies)) {
    if (key.startsWith('@types/')) delete pkg.dependencies[key];
  }
}

// devDependencies are never needed on EB — drop them entirely.
delete pkg.devDependencies;

// Ensure the start script points to the correct bundled output file.
pkg.scripts = { start: 'node dist/index.cjs' };

require('fs').writeFileSync(
  '$STAGING_DIR/package.json',
  JSON.stringify(pkg, null, 2)
);
console.log('  → Clean package.json written.');
"

# ── 6. ZIP ──────────────────────────────────────────────────
echo "[4/5] Creating ZIP: $ZIP_NAME"
rm -f "$ZIP_NAME"
cd "$STAGING_DIR" && zip -r "../$ZIP_NAME" . --quiet && cd ..
rm -rf "$STAGING_DIR"

# ── 7. Confirm ──────────────────────────────────────────────
SIZE=$(du -sh "$ZIP_NAME" | cut -f1)
echo "[5/5] Done! Package ready: $ZIP_NAME ($SIZE)"
echo ""
echo "Dependencies bundled in dist/index.cjs : bcryptjs (pure-JS), AWS SDK, etc."
echo "Dependencies installed by EB npm install: everything in package.json EXCEPT @types/*"
echo "Native bcrypt : NOT present — bcryptjs is used throughout"
echo ""
echo "Next step: Upload $ZIP_NAME to Elastic Beanstalk"
echo "  EB Console → brs-connect-prod-v2 → Upload and deploy → choose $ZIP_NAME"
echo ""
