/**
 * Ensure all required schema columns exist before the app starts.
 * This runs raw SQL with IF NOT EXISTS so it's idempotent & safe.
 */
const { Client } = require('pg');

async function patchSchema() {
    const c = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });

    try {
        await c.connect();
        console.log('  Connected to database');

        // Add missing columns
        await c.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS google_maps_link TEXT');
        console.log('  ✓ google_maps_link column ensured');

    } catch (e) {
        console.error('  Schema patch warning:', e.message);
    } finally {
        await c.end();
    }
}

patchSchema().then(() => {
    console.log('  Schema patch complete');
    process.exit(0);
}).catch((e) => {
    console.error('  Schema patch failed:', e.message);
    process.exit(1);
});
