import { MigrationInterface, QueryRunner } from "typeorm";

export class Gration121712511513153 implements MigrationInterface {
    name = 'Gration121712511513153'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`disable\` tinyint NOT NULL DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`disable\``);
    }

}
