import { MigrationInterface, QueryRunner } from "typeorm";

export class Gration091711704555365 implements MigrationInterface {
    name = 'Gration091711704555365'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`order_detail\` DROP COLUMN \`dateReview\``);
        await queryRunner.query(`ALTER TABLE \`order_detail\` ADD \`dateReview\` datetime NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`order\` DROP COLUMN \`dateOrder\``);
        await queryRunner.query(`ALTER TABLE \`order\` ADD \`dateOrder\` datetime NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`order\` DROP COLUMN \`dateOrder\``);
        await queryRunner.query(`ALTER TABLE \`order\` ADD \`dateOrder\` varchar(255) COLLATE "utf8mb4_0900_ai_ci" NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`order_detail\` DROP COLUMN \`dateReview\``);
        await queryRunner.query(`ALTER TABLE \`order_detail\` ADD \`dateReview\` varchar(255) COLLATE "utf8mb4_0900_ai_ci" NOT NULL`);
    }

}
