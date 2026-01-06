import { MigrationInterface, QueryRunner } from 'typeorm';

export class UsersTable1761608479607 implements MigrationInterface {
  name = 'Migrations1761608479607';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "users" (
        "id" SERIAL NOT NULL, 
        "name" character varying NOT NULL, 
        "email" character varying NOT NULL, 
        "passwordHash" character varying(255) NOT NULL, 
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(), 
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), 
        "isActive" boolean NOT NULL DEFAULT true, 
        CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "user"`);
  }
}
