import { MigrationInterface, QueryRunner } from "typeorm";

export class Garion021709798711827 implements MigrationInterface {
    name = 'Garion021709798711827'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` ADD UNIQUE INDEX \`IDX_da5934070b5f2726ebfd3122c8\` (\`userName\`)`);
        await queryRunner.query(`ALTER TABLE \`user\` ADD UNIQUE INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` (\`email\`)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` DROP INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\``);
        await queryRunner.query(`ALTER TABLE \`user\` DROP INDEX \`IDX_da5934070b5f2726ebfd3122c8\``);
    }

}
