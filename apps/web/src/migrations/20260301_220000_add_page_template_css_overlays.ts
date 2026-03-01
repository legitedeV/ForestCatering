import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "page_template" varchar DEFAULT 'default';
    ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "global_css_overlay" varchar;
    ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "layout_css_overlay" varchar;

    ALTER TABLE "_pages_v" ADD COLUMN IF NOT EXISTS "version_page_template" varchar DEFAULT 'default';
    ALTER TABLE "_pages_v" ADD COLUMN IF NOT EXISTS "version_global_css_overlay" varchar;
    ALTER TABLE "_pages_v" ADD COLUMN IF NOT EXISTS "version_layout_css_overlay" varchar;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "pages" DROP COLUMN IF EXISTS "page_template";
    ALTER TABLE "pages" DROP COLUMN IF EXISTS "global_css_overlay";
    ALTER TABLE "pages" DROP COLUMN IF EXISTS "layout_css_overlay";

    ALTER TABLE "_pages_v" DROP COLUMN IF EXISTS "version_page_template";
    ALTER TABLE "_pages_v" DROP COLUMN IF EXISTS "version_global_css_overlay";
    ALTER TABLE "_pages_v" DROP COLUMN IF EXISTS "version_layout_css_overlay";
  `)
}
