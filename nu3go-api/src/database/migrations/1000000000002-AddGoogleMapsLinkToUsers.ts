import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGoogleMapsLinkToUsers1000000000002 implements MigrationInterface {
    name = 'AddGoogleMapsLinkToUsers1000000000002';

    async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE users ADD COLUMN IF NOT EXISTS google_maps_link TEXT`,
        );
    }

    async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE users DROP COLUMN IF EXISTS google_maps_link`,
        );
    }
}
