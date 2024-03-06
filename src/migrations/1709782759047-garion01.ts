import { MigrationInterface, QueryRunner } from "typeorm";

export class Garion011709782759047 implements MigrationInterface {
    name = 'Garion011709782759047'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`category\` (\`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`description\` varchar(255) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`cart\` (\`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` int NOT NULL AUTO_INCREMENT, \`user_id\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`cart_item\` (\`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` int NOT NULL AUTO_INCREMENT, \`quantity\` int NOT NULL, \`product_id\` int NULL, \`cart_id\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`product_image\` (\`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` int NOT NULL AUTO_INCREMENT, \`image\` varchar(255) NOT NULL, \`product_id\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`product\` (\`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`description\` varchar(255) NULL, \`price\` double NOT NULL, \`quantity\` int NOT NULL, \`image\` varchar(255) NULL, \`disable\` int NULL, \`unit\` varchar(255) NULL, \`category_id\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`order_detail\` (\`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` int NOT NULL AUTO_INCREMENT, \`quantity\` int NOT NULL, \`price\` double NOT NULL, \`order_id\` int NULL, \`product_id\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`order\` (\`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` int NOT NULL AUTO_INCREMENT, \`totalAmount\` double NOT NULL, \`status\` int NOT NULL, \`typeOrder\` int NULL, \`address\` varchar(255) NULL, \`image\` varchar(255) NULL, \`name\` varchar(255) NULL, \`phone\` varchar(255) NULL, \`user_id\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`user\` (\`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` int NOT NULL AUTO_INCREMENT, \`userName\` varchar(255) NULL, \`password\` varchar(255) NOT NULL, \`email\` varchar(255) NOT NULL, \`role\` int NULL, \`fullName\` varchar(255) NULL, \`image\` varchar(255) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`cart\` ADD CONSTRAINT \`FK_f091e86a234693a49084b4c2c86\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`cart_item\` ADD CONSTRAINT \`FK_67a2e8406e01ffa24ff9026944e\` FOREIGN KEY (\`product_id\`) REFERENCES \`product\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`cart_item\` ADD CONSTRAINT \`FK_b6b2a4f1f533d89d218e70db941\` FOREIGN KEY (\`cart_id\`) REFERENCES \`cart\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`product_image\` ADD CONSTRAINT \`FK_dbc7d9aa7ed42c9141b968a9ed3\` FOREIGN KEY (\`product_id\`) REFERENCES \`product\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`product\` ADD CONSTRAINT \`FK_0dce9bc93c2d2c399982d04bef1\` FOREIGN KEY (\`category_id\`) REFERENCES \`category\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`order_detail\` ADD CONSTRAINT \`FK_a6ac5c99b8c02bd4ee53d3785be\` FOREIGN KEY (\`order_id\`) REFERENCES \`order\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`order_detail\` ADD CONSTRAINT \`FK_985d5f728e1eebe4a3eabc43aac\` FOREIGN KEY (\`product_id\`) REFERENCES \`product\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`order\` ADD CONSTRAINT \`FK_199e32a02ddc0f47cd93181d8fd\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`order\` DROP FOREIGN KEY \`FK_199e32a02ddc0f47cd93181d8fd\``);
        await queryRunner.query(`ALTER TABLE \`order_detail\` DROP FOREIGN KEY \`FK_985d5f728e1eebe4a3eabc43aac\``);
        await queryRunner.query(`ALTER TABLE \`order_detail\` DROP FOREIGN KEY \`FK_a6ac5c99b8c02bd4ee53d3785be\``);
        await queryRunner.query(`ALTER TABLE \`product\` DROP FOREIGN KEY \`FK_0dce9bc93c2d2c399982d04bef1\``);
        await queryRunner.query(`ALTER TABLE \`product_image\` DROP FOREIGN KEY \`FK_dbc7d9aa7ed42c9141b968a9ed3\``);
        await queryRunner.query(`ALTER TABLE \`cart_item\` DROP FOREIGN KEY \`FK_b6b2a4f1f533d89d218e70db941\``);
        await queryRunner.query(`ALTER TABLE \`cart_item\` DROP FOREIGN KEY \`FK_67a2e8406e01ffa24ff9026944e\``);
        await queryRunner.query(`ALTER TABLE \`cart\` DROP FOREIGN KEY \`FK_f091e86a234693a49084b4c2c86\``);
        await queryRunner.query(`DROP TABLE \`user\``);
        await queryRunner.query(`DROP TABLE \`order\``);
        await queryRunner.query(`DROP TABLE \`order_detail\``);
        await queryRunner.query(`DROP TABLE \`product\``);
        await queryRunner.query(`DROP TABLE \`product_image\``);
        await queryRunner.query(`DROP TABLE \`cart_item\``);
        await queryRunner.query(`DROP TABLE \`cart\``);
        await queryRunner.query(`DROP TABLE \`category\``);
    }

}
