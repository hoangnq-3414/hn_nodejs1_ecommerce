import { MigrationInterface, QueryRunner } from "typeorm";

export class Gration081711646652114 implements MigrationInterface {
    name = 'Gration081711646652114'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`product_review\` (\`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` int NOT NULL AUTO_INCREMENT, \`comment\` text NOT NULL, \`rating\` int NOT NULL, \`userId\` int NULL, \`productId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`order_detail\` ADD \`reviewed\` tinyint NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE \`order_detail\` ADD \`dateOrder\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`product_review\` ADD CONSTRAINT \`FK_db21a1dc776b455ee83eb7ff88e\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`product_review\` ADD CONSTRAINT \`FK_06e7335708b5e7870f1eaa608d2\` FOREIGN KEY (\`productId\`) REFERENCES \`product\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`product_review\` DROP FOREIGN KEY \`FK_06e7335708b5e7870f1eaa608d2\``);
        await queryRunner.query(`ALTER TABLE \`product_review\` DROP FOREIGN KEY \`FK_db21a1dc776b455ee83eb7ff88e\``);
        await queryRunner.query(`ALTER TABLE \`order_detail\` DROP COLUMN \`dateOrder\``);
        await queryRunner.query(`ALTER TABLE \`order_detail\` DROP COLUMN \`reviewed\``);
        await queryRunner.query(`DROP TABLE \`product_review\``);
    }

}
