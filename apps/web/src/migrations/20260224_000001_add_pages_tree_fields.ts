import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "path" varchar;
    ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "parent_id" integer;
    ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "sort_order" numeric DEFAULT 0;

    CREATE INDEX IF NOT EXISTS "pages_parent_idx" ON "pages" USING btree ("parent_id");
    CREATE INDEX IF NOT EXISTS "pages_path_idx" ON "pages" USING btree ("path");
    CREATE UNIQUE INDEX IF NOT EXISTS "pages_path_unique" ON "pages" USING btree ("path");

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'pages_parent_fk'
      ) THEN
        ALTER TABLE "pages"
          ADD CONSTRAINT "pages_parent_fk"
          FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id")
          ON DELETE set null ON UPDATE no action;
      END IF;
    END $$;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "pages" DROP CONSTRAINT IF EXISTS "pages_parent_fk";
    DROP INDEX IF EXISTS "pages_path_unique";
    DROP INDEX IF EXISTS "pages_path_idx";
    DROP INDEX IF EXISTS "pages_parent_idx";
    ALTER TABLE "pages" DROP COLUMN IF EXISTS "sort_order";
    ALTER TABLE "pages" DROP COLUMN IF EXISTS "parent_id";
    ALTER TABLE "pages" DROP COLUMN IF EXISTS "path";
  `)
}
