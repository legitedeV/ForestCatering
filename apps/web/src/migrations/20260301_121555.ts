import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_orders_payment_provider" AS ENUM('p24', 'dotpay');
  ALTER TYPE "public"."enum_products_product_type" ADD VALUE 'rental';
  ALTER TABLE "orders" ALTER COLUMN "status" SET DATA TYPE text;
  ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'pending_payment'::text;
  DROP TYPE "public"."enum_orders_status";
  CREATE TYPE "public"."enum_orders_status" AS ENUM('pending_payment', 'paid', 'failed', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled');
  ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'pending_payment'::"public"."enum_orders_status";
  ALTER TABLE "orders" ALTER COLUMN "status" SET DATA TYPE "public"."enum_orders_status" USING "status"::"public"."enum_orders_status";
  ALTER TABLE "products" ADD COLUMN "image_url" varchar;
  ALTER TABLE "products" ADD COLUMN "unsplash_id" varchar;
  ALTER TABLE "products" ADD COLUMN "color" varchar;
  ALTER TABLE "orders" ADD COLUMN "payment_provider" "enum_orders_payment_provider";
  ALTER TABLE "orders" ADD COLUMN "payment_session_id" varchar;
  ALTER TABLE "orders" ADD COLUMN "transaction_id" varchar;
  ALTER TABLE "orders" ADD COLUMN "payment_meta" jsonb;
  ALTER TABLE "media" ADD COLUMN "image_slug" varchar NOT NULL;
  CREATE UNIQUE INDEX "media_image_slug_idx" ON "media" USING btree ("image_slug");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "products" ALTER COLUMN "product_type" SET DATA TYPE text;
  ALTER TABLE "products" ALTER COLUMN "product_type" SET DEFAULT 'catering'::text;
  DROP TYPE "public"."enum_products_product_type";
  CREATE TYPE "public"."enum_products_product_type" AS ENUM('catering', 'event', 'bar');
  ALTER TABLE "products" ALTER COLUMN "product_type" SET DEFAULT 'catering'::"public"."enum_products_product_type";
  ALTER TABLE "products" ALTER COLUMN "product_type" SET DATA TYPE "public"."enum_products_product_type" USING "product_type"::"public"."enum_products_product_type";
  ALTER TABLE "orders" ALTER COLUMN "status" SET DATA TYPE text;
  ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'pending'::text;
  DROP TYPE "public"."enum_orders_status";
  CREATE TYPE "public"."enum_orders_status" AS ENUM('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled');
  ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'pending'::"public"."enum_orders_status";
  ALTER TABLE "orders" ALTER COLUMN "status" SET DATA TYPE "public"."enum_orders_status" USING "status"::"public"."enum_orders_status";
  DROP INDEX "media_image_slug_idx";
  ALTER TABLE "products" DROP COLUMN "image_url";
  ALTER TABLE "products" DROP COLUMN "unsplash_id";
  ALTER TABLE "products" DROP COLUMN "color";
  ALTER TABLE "orders" DROP COLUMN "payment_provider";
  ALTER TABLE "orders" DROP COLUMN "payment_session_id";
  ALTER TABLE "orders" DROP COLUMN "transaction_id";
  ALTER TABLE "orders" DROP COLUMN "payment_meta";
  ALTER TABLE "media" DROP COLUMN "image_slug";
  DROP TYPE "public"."enum_orders_payment_provider";`)
}
