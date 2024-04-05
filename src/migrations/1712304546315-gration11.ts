import { MigrationInterface, QueryRunner } from "typeorm";

export class Gration111712304546315 implements MigrationInterface {
    name = 'Gration111712304546315'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`category\` ADD \`disable\` tinyint NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE \`product\` DROP COLUMN \`disable\``);
        await queryRunner.query(`ALTER TABLE \`product\` ADD \`disable\` tinyint NOT NULL DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`product\` DROP COLUMN \`disable\``);
        await queryRunner.query(`ALTER TABLE \`product\` ADD \`disable\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`category\` DROP COLUMN \`disable\``);
    }

}
