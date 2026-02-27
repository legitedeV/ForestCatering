import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "image_slug" varchar;

    UPDATE "media"
    SET "image_slug" = CONCAT('image-', "id"::text)
    WHERE "image_slug" IS NULL OR "image_slug" = '';

    ALTER TABLE "media" ALTER COLUMN "image_slug" SET NOT NULL;

    CREATE UNIQUE INDEX IF NOT EXISTS "media_image_slug_idx" ON "media" USING btree ("image_slug");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "media_image_slug_idx";
    ALTER TABLE "media" DROP COLUMN IF EXISTS "image_slug";
  `)
}
