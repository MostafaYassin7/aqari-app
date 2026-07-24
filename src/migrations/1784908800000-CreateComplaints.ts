import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateComplaints1784908800000 implements MigrationInterface {
  name = 'CreateComplaints1784908800000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "complaints" (
        "id"        uuid              NOT NULL DEFAULT uuid_generate_v4(),
        "number"    character varying NOT NULL,
        "name"      character varying NOT NULL,
        "phone"     character varying NOT NULL,
        "email"     character varying,
        "subject"   character varying NOT NULL,
        "message"   text              NOT NULL,
        "status"    character varying NOT NULL DEFAULT 'received',
        "createdAt" TIMESTAMP         NOT NULL DEFAULT now(),
        CONSTRAINT "PK_complaints" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_complaints_number" UNIQUE ("number"),
        CONSTRAINT "CHK_complaints_status"
          CHECK ("status" IN ('received', 'in_review', 'resolved'))
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_complaints_status" ON "complaints" ("status")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_complaints_createdAt" ON "complaints" ("createdAt")`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "complaints"`);
  }
}
