import { MigrationInterface, QueryRunner } from "typeorm";

export class Gration061710901907416 implements MigrationInterface {
    name = 'Gration061710901907416'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`name\` ON \`product\``);
        await queryRunner.query(`ALTER TABLE \`order\` ADD \`comment\` text NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`order\` DROP COLUMN \`comment\``);
        await queryRunner.query(`CREATE FULLTEXT INDEX \`name\` ON \`product\` (\`name\`, \`description\`)`);
    }

}
