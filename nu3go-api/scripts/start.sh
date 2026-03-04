#!/bin/sh
set -e

echo "=== Running migrations ==="
npx typeorm migration:run -d dist/database/typeorm.config.js || echo "Migration warning (non-fatal)"

echo "=== Seeding admin user ==="
node scripts/seed-admin.js || echo "Seed warning (non-fatal)"

echo "=== Starting nu3go API ==="
exec node dist/main
