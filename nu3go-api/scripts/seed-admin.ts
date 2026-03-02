/**
 * nu3go Admin Seed Script
 * Usage:
 *   npx ts-node -r tsconfig-paths/register scripts/seed-admin.ts
 *
 * Env required: DATABASE_URL  (or set inline below)
 */
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as readline from 'readline';

dotenv.config({ path: path.resolve(__dirname, '../.env.development') });

// ─── Admin credentials ────────────────────────────────────────────────────────
const ADMIN_EMAIL = 'admin@nu3go.lk';
const ADMIN_PASSWORD = 'Admin@nu3go2024!';   // Change this after first login
const ADMIN_NAME = 'nu3go Admin';
const ADMIN_PHONE = '+94771234567';
// ─────────────────────────────────────────────────────────────────────────────

async function seed() {
    const ds = new DataSource({
        type: 'postgres',
        url: process.env.DATABASE_URL,
        ssl: false,
    });

    await ds.initialize();
    console.log('✅  Connected to database');

    // Check if admin already exists
    const existing = await ds.query(
        `SELECT id FROM users WHERE email = $1`,
        [ADMIN_EMAIL],
    );

    if (existing.length > 0) {
        console.log(`⚠️   Admin already exists: ${ADMIN_EMAIL}`);
        await ds.destroy();
        return;
    }

    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);

    const [admin] = await ds.query(
        `INSERT INTO users (email, password_hash, full_name, phone, role, is_verified, is_active)
     VALUES ($1, $2, $3, $4, 'super_admin', true, true)
     RETURNING id, email, role`,
        [ADMIN_EMAIL, passwordHash, ADMIN_NAME, ADMIN_PHONE],
    );

    console.log('\n🎉  Admin account created!');
    console.log('────────────────────────────────');
    console.log(`   Email:    ${admin.email}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
    console.log(`   Role:     ${admin.role}`);
    console.log('────────────────────────────────');
    console.log('⚠️   Please change the password after first login.\n');

    await ds.destroy();
}

seed().catch(err => {
    console.error('❌  Seed failed:', err.message);
    process.exit(1);
});
