import { MigrationInterface, QueryRunner } from "typeorm";

export class Gration061710957285208 implements MigrationInterface {
    name = 'Gration061710957285208'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`order\` ADD \`comment\` text NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`order\` DROP COLUMN \`comment\``);
    }

}
