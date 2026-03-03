const { AppDataSource } = require('../dist/database/typeorm.config');
const { User } = require('../dist/modules/users/entities/user.entity');
const bcrypt = require('bcryptjs');

const ADMIN_EMAIL = 'admin@nu3go.lk';
const ADMIN_PASSWORD = 'Admin@nu3go2024!';

async function seed() {
    await AppDataSource.initialize();
    console.log("Database connected. Seeding admin user...");

    const userRepo = AppDataSource.getRepository(User);

    const existingAdmin = await userRepo.findOneBy({ email: ADMIN_EMAIL });
    if (existingAdmin) {
        console.log("Admin user already exists. Skipping seed.");
        process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);

    const admin = userRepo.create({
        email: ADMIN_EMAIL,
        password: hashedPassword,
        fullName: 'nu3go Admin',
        role: 'super_admin',
        isActive: true,
        isVerified: true,
    });

    await userRepo.save(admin);
    console.log("Admin user seeded successfully!");
    console.log(`Email: ${ADMIN_EMAIL}`);
    console.log(`Password: ${ADMIN_PASSWORD}`);

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
