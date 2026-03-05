#!/bin/sh

echo "=== Applying schema patches ==="
node scripts/patch-schema.js || echo "[WARN] Schema patch had issues (non-fatal)"

echo "=== Running migrations ==="
npx typeorm migration:run -d dist/database/typeorm.config.js || echo "[WARN] Migrations had issues (non-fatal)"

echo "=== Seeding admin user ==="
node scripts/seed-admin.js || echo "[WARN] Seed had issues (non-fatal)"

echo "=== Starting nu3go API ==="
exec node dist/main
