#!/bin/sh
set -e

echo "=== Applying critical schema patches ==="
node -e "
const { Client } = require('pg');
const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
c.connect()
  .then(() => c.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS google_maps_link TEXT'))
  .then(() => { console.log('  google_maps_link column ensured'); return c.end(); })
  .catch(e => { console.error('  patch warning:', e.message); return c.end(); });
" 2>&1 || echo "Schema patch warning (non-fatal)"

echo "=== Running migrations ==="
npx typeorm migration:run -d dist/database/typeorm.config.js 2>&1 || echo "Migration warning (non-fatal)"

echo "=== Seeding admin user ==="
node scripts/seed-admin.js 2>&1 || echo "Seed warning (non-fatal)"

echo "=== Starting nu3go API ==="
exec node dist/main
