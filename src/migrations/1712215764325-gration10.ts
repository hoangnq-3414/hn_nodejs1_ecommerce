import { MigrationInterface, QueryRunner } from "typeorm";

export class Gration101712215764325 implements MigrationInterface {
    name = 'Gration101712215764325'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`product\` ADD \`numberSold\` int NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`product\` DROP COLUMN \`numberSold\``);
    }

}
