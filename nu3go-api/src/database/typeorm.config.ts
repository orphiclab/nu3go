import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load the appropriate .env file based on NODE_ENV
const envFile = process.env.NODE_ENV === 'production'
    ? '.env.production'
    : '.env.development';

dotenv.config({ path: path.resolve(__dirname, `../../${envFile}`) });
// Fallback: also try loading from parent directory (for compiled dist/)
dotenv.config({ path: path.resolve(__dirname, `../${envFile}`) });

export const AppDataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: [path.join(__dirname, '/../modules/**/entities/*.entity{.ts,.js}')],
    migrations: [path.join(__dirname, '/migrations/*{.ts,.js}')],
    logging: process.env.NODE_ENV !== 'production',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});
