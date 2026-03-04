import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1000000000000 implements MigrationInterface {
  name = 'InitialSchema1000000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    // Enable UUID extension
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // ─── Users ───────────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TYPE user_role AS ENUM (
        'super_admin','admin','kitchen_staff','delivery_manager',
        'corporate_admin','customer'
      );

      CREATE TABLE users (
        id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email           VARCHAR(255) UNIQUE NOT NULL,
        password_hash   VARCHAR(255) NOT NULL,
        full_name       VARCHAR(255) NOT NULL,
        phone           VARCHAR(20),
        role            user_role NOT NULL DEFAULT 'customer',
        is_verified     BOOLEAN NOT NULL DEFAULT FALSE,
        is_active       BOOLEAN NOT NULL DEFAULT TRUE,
        delivery_address TEXT,
        delivery_area   VARCHAR(100),
        delivery_notes  TEXT,
        google_maps_link TEXT,
        nfc_card_uid    VARCHAR(64) UNIQUE,
        nfc_hmac_key    VARCHAR(128),
        corporate_id    UUID,
        created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX idx_users_email ON users(email);
      CREATE INDEX idx_users_corporate ON users(corporate_id) WHERE corporate_id IS NOT NULL;
    `);

    // ─── Plans ────────────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TYPE plan_type AS ENUM ('pickup','delivery','hybrid');

      CREATE TABLE plans (
        id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name          VARCHAR(100) UNIQUE NOT NULL,
        slug          VARCHAR(100) UNIQUE NOT NULL,
        type          plan_type NOT NULL,
        price_lkr     DECIMAL(10,2) NOT NULL,
        meal_count    INTEGER,
        billing_days  INTEGER NOT NULL DEFAULT 30,
        description   TEXT,
        features      JSONB NOT NULL DEFAULT '[]',
        is_active     BOOLEAN NOT NULL DEFAULT TRUE,
        is_corporate  BOOLEAN NOT NULL DEFAULT FALSE,
        created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      INSERT INTO plans (name, slug, type, price_lkr, meal_count, billing_days, features) VALUES
        ('Daily Pickup', 'daily-pickup', 'pickup', 3500, NULL, 30, '["Unlimited pickups","Any pickup location","QR + NFC access"]'),
        ('Hybrid 12 Meals', 'hybrid-12', 'hybrid', 4200, 12, 30, '["12 flexible meals","Pickup or delivery","QR + NFC access","Credits for unused meals"]'),
        ('Daily Delivery', 'daily-delivery', 'delivery', 5500, NULL, 30, '["Daily delivery","Free delivery","Scheduled before 8AM","WhatsApp updates"]');
    `);

    // ─── Locations ───────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE locations (
        id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name        VARCHAR(100) NOT NULL,
        address     TEXT,
        city        VARCHAR(100) NOT NULL DEFAULT 'Colombo',
        area        VARCHAR(100),
        is_active   BOOLEAN NOT NULL DEFAULT TRUE,
        open_time   TIME DEFAULT '07:30',
        close_time  TIME DEFAULT '09:30',
        lat         DECIMAL(9,6),
        lng         DECIMAL(9,6),
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      INSERT INTO locations (name, address, city, area, open_time, close_time) VALUES
        ('Colombo 07', '42 Gregory''s Road, Colombo 07', 'Colombo', 'Colombo 07', '07:30', '09:30'),
        ('Colombo 03', '10 Galle Road, Colombo 03', 'Colombo', 'Colombo 03', '07:30', '09:30');
    `);

    // ─── Corporate Accounts ──────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE corporate_accounts (
        id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        company_name     VARCHAR(200) NOT NULL,
        contact_person   VARCHAR(200) NOT NULL,
        contact_email    VARCHAR(255) NOT NULL,
        city             VARCHAR(100),
        is_active        BOOLEAN NOT NULL DEFAULT TRUE,
        total_paid_lkr   DECIMAL(12,2) NOT NULL DEFAULT 0,
        created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // ─── Subscriptions ───────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TYPE subscription_status AS ENUM ('pending','active','paused','expired','cancelled');
      CREATE TYPE day_of_week AS ENUM ('monday','tuesday','wednesday','thursday','friday','saturday','sunday');

      CREATE TABLE subscriptions (
        id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id          UUID NOT NULL REFERENCES users(id),
        plan_id          UUID NOT NULL REFERENCES plans(id),
        location_id      UUID REFERENCES locations(id),
        status           subscription_status NOT NULL DEFAULT 'pending',
        type             plan_type NOT NULL,
        start_date       DATE NOT NULL,
        end_date         DATE NOT NULL,
        start_day        day_of_week,
        meals_remaining  INTEGER,
        meals_used       INTEGER NOT NULL DEFAULT 0,
        auto_renew       BOOLEAN NOT NULL DEFAULT TRUE,
        paused_at        TIMESTAMPTZ,
        pause_reason     TEXT,
        created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
      CREATE INDEX idx_subscriptions_status ON subscriptions(status);
      CREATE INDEX idx_subscriptions_end_date ON subscriptions(end_date) WHERE status = 'active';
    `);

    // ─── Pause Logs ──────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE pause_logs (
        id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        subscription_id UUID NOT NULL REFERENCES subscriptions(id),
        user_id         UUID NOT NULL REFERENCES users(id),
        paused_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        resumed_at      TIMESTAMPTZ,
        reason          TEXT,
        credit_issued   DECIMAL(10,2) NOT NULL DEFAULT 0
      );
    `);

    // ─── Meal Logs ───────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TYPE pickup_method AS ENUM ('nfc','qr','manual','delivery');

      CREATE TABLE meal_logs (
        id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        subscription_id UUID NOT NULL REFERENCES subscriptions(id),
        user_id         UUID NOT NULL REFERENCES users(id),
        location_id     UUID REFERENCES locations(id),
        type            VARCHAR(20) NOT NULL DEFAULT 'pickup',
        method          pickup_method NOT NULL,
        meal_date       DATE NOT NULL,
        confirmed_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        is_voided       BOOLEAN NOT NULL DEFAULT FALSE,
        voided_by       UUID REFERENCES users(id),
        void_reason     TEXT,
        UNIQUE(subscription_id, meal_date)
      );

      CREATE INDEX idx_meal_logs_user_date ON meal_logs(user_id, meal_date);
      CREATE INDEX idx_meal_logs_date ON meal_logs(meal_date);
    `);

    // ─── Delivery Logs ───────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE delivery_logs (
        id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        meal_log_id UUID UNIQUE REFERENCES meal_logs(id),
        status      VARCHAR(20) NOT NULL DEFAULT 'pending',
        updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // ─── Credit Wallets & Transactions ───────────────────────────────────────
    await queryRunner.query(`
      CREATE TYPE credit_type AS ENUM ('earn','redeem','expire','holiday','admin_adjustment');

      CREATE TABLE credit_wallets (
        id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id     UUID UNIQUE NOT NULL REFERENCES users(id),
        balance_lkr DECIMAL(10,2) NOT NULL DEFAULT 0,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE credit_transactions (
        id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id         UUID NOT NULL REFERENCES users(id),
        subscription_id UUID REFERENCES subscriptions(id),
        type            credit_type NOT NULL,
        amount_lkr      DECIMAL(10,2) NOT NULL,
        balance_after   DECIMAL(10,2) NOT NULL,
        reason          TEXT,
        reference_id    UUID,
        created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX idx_credit_tx_user ON credit_transactions(user_id, created_at DESC);
    `);

    // ─── Payment Transactions ────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE payment_transactions (
        id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id         UUID NOT NULL REFERENCES users(id),
        subscription_id UUID REFERENCES subscriptions(id),
        gateway         VARCHAR(30) NOT NULL DEFAULT 'manual',
        payment_type    VARCHAR(30) NOT NULL DEFAULT 'subscription',
        amount_lkr      DECIMAL(10,2) NOT NULL,
        status          VARCHAR(20) NOT NULL DEFAULT 'pending',
        gateway_ref     VARCHAR(255),
        invoice_url     TEXT,
        created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX idx_payment_tx_user ON payment_transactions(user_id, created_at DESC);
    `);

    // ─── Menu Items ──────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE menu_items (
        id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name        VARCHAR(200) NOT NULL,
        description TEXT,
        image_url   TEXT,
        calories    INTEGER,
        tags        JSONB DEFAULT '[]',
        is_active   BOOLEAN NOT NULL DEFAULT TRUE,
        valid_from  DATE,
        valid_to    DATE,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // ─── Kitchen Print Logs ──────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE kitchen_print_logs (
        date        DATE PRIMARY KEY,
        printed_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS kitchen_print_logs CASCADE;
      DROP TABLE IF EXISTS menu_items CASCADE;
      DROP TABLE IF EXISTS payment_transactions CASCADE;
      DROP TABLE IF EXISTS credit_transactions CASCADE;
      DROP TABLE IF EXISTS credit_wallets CASCADE;
      DROP TABLE IF EXISTS delivery_logs CASCADE;
      DROP TABLE IF EXISTS meal_logs CASCADE;
      DROP TABLE IF EXISTS pause_logs CASCADE;
      DROP TABLE IF EXISTS subscriptions CASCADE;
      DROP TABLE IF EXISTS corporate_accounts CASCADE;
      DROP TABLE IF EXISTS locations CASCADE;
      DROP TABLE IF EXISTS plans CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
      DROP TYPE IF EXISTS credit_type CASCADE;
      DROP TYPE IF EXISTS pickup_method CASCADE;
      DROP TYPE IF EXISTS subscription_status CASCADE;
      DROP TYPE IF EXISTS day_of_week CASCADE;
      DROP TYPE IF EXISTS plan_type CASCADE;
      DROP TYPE IF EXISTS user_role CASCADE;
    `);
  }
}
