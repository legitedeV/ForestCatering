import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "payment_provider" varchar;
    ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "payment_session_id" varchar;
    ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "transaction_id" varchar;
    ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "payment_meta" jsonb;

    UPDATE "orders"
    SET "status" = 'pending_payment'
    WHERE "status" = 'pending';
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "orders" DROP COLUMN IF EXISTS "payment_meta";
    ALTER TABLE "orders" DROP COLUMN IF EXISTS "transaction_id";
    ALTER TABLE "orders" DROP COLUMN IF EXISTS "payment_session_id";
    ALTER TABLE "orders" DROP COLUMN IF EXISTS "payment_provider";
  `)
}
