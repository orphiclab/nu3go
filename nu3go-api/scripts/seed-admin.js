const { DataSource } = require('typeorm');
const bcrypt = require('bcryptjs');

const ADMIN_EMAIL = 'admin@nu3go.lk';
const ADMIN_PASSWORD = 'Admin@nu3go2024!';

async function seed() {
    const ds = new DataSource({
        type: 'postgres',
        url: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });

    await ds.initialize();
    console.log("Database connected. Seeding admin user...");

    // Check if admin already exists
    const existing = await ds.query(
        `SELECT id FROM users WHERE email = $1`,
        [ADMIN_EMAIL],
    );

    if (existing.length > 0) {
        console.log("Admin user already exists. Skipping seed.");
        await ds.destroy();
        process.exit(0);
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);

    const [admin] = await ds.query(
        `INSERT INTO users (email, password_hash, full_name, phone, role, is_verified, is_active)
         VALUES ($1, $2, $3, $4, 'super_admin', true, true)
         RETURNING id, email, role`,
        [ADMIN_EMAIL, hashedPassword, 'nu3go Admin', '+94771234567'],
    );

    console.log("Admin user seeded successfully!");
    console.log(`Email: ${ADMIN_EMAIL}`);
    console.log(`Password: ${ADMIN_PASSWORD}`);
    console.log(`Role: ${admin.role}`);

    await ds.destroy();
    process.exit(0);
}

seed().catch((err) => {
    console.error("=========================================");
    console.error("SEEDING FAILED IN PRODUCTION:");
    console.error(err);
    if (err.stack) console.error(err.stack);
    console.error("=========================================");
    process.exit(1);
});
