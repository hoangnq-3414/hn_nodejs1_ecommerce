import { MigrationInterface, QueryRunner } from "typeorm";

export class Gration071711437009945 implements MigrationInterface {
    name = 'Gration071711437009945'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`name\` ON \`product\``);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`address\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`phone\` varchar(255) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`phone\``);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`address\``);
        await queryRunner.query(`CREATE FULLTEXT INDEX \`name\` ON \`product\` (\`name\`, \`description\`)`);
    }
}
