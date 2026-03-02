import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNfcCardsAndQrTokens1000000000001 implements MigrationInterface {
    name = 'AddNfcCardsAndQrTokens1000000000001';

    async up(queryRunner: QueryRunner): Promise<void> {
        // NFC Cards table
        await queryRunner.query(`
      CREATE TABLE nfc_cards (
        id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        card_uid     VARCHAR(64) UNIQUE NOT NULL,
        user_id      UUID REFERENCES users(id) ON DELETE SET NULL,
        secret_hash  VARCHAR(128) NOT NULL,
        label        VARCHAR(100),
        is_active    BOOLEAN NOT NULL DEFAULT TRUE,
        created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX idx_nfc_cards_user ON nfc_cards(user_id) WHERE user_id IS NOT NULL;

      -- Add nfc_card_uid to users for quick lookup
      ALTER TABLE users ADD COLUMN IF NOT EXISTS nfc_card_uid VARCHAR(64);
    `);

        // QR Tokens table (single-use pickup tokens)
        await queryRunner.query(`
      CREATE TABLE qr_tokens (
        id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id     UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token       TEXT NOT NULL,
        expires_at  TIMESTAMPTZ NOT NULL,
        is_used     BOOLEAN NOT NULL DEFAULT FALSE,
        used_at     TIMESTAMPTZ,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX idx_qr_tokens_token ON qr_tokens(token);
    `);
    }

    async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
      DROP TABLE IF EXISTS qr_tokens CASCADE;
      DROP TABLE IF EXISTS nfc_cards CASCADE;
      ALTER TABLE users DROP COLUMN IF EXISTS nfc_card_uid;
    `);
    }
}
