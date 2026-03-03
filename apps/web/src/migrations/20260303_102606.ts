import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Consolidation migration – brings the DB fully in sync with the Payload
 * schema.  It is **idempotent**: every statement uses IF NOT EXISTS / IF EXISTS
 * so it is safe to run regardless of which earlier hand-written migrations
 * (20260301_220000, 20260301_230000) have or have not been applied.
 *
 * Changes covered:
 *  1. ENUM types for page_template (pages + _pages_v)
 *  2. page_template / css overlay columns on pages & _pages_v
 *  3. Visual-editor columns on all 19 block tables (×2 for versioned)
 *  4. Fix varchar→enum conversion for page_template if the earlier
 *     migration created it with the wrong type
 */

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // ── 1. Create ENUM types (safe if they already exist) ───────────────
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "public"."enum_pages_page_template" AS ENUM('default', 'template-a', 'template-b', 'template-c', 'template-d');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;

    DO $$ BEGIN
      CREATE TYPE "public"."enum__pages_v_version_page_template" AS ENUM('default', 'template-a', 'template-b', 'template-c', 'template-d');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `)

  // ── 2. pages & _pages_v columns ────────────────────────────────────
  await db.execute(sql`
    ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "page_template" varchar DEFAULT 'default';
    ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "global_css_overlay" varchar;
    ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "layout_css_overlay" varchar;

    ALTER TABLE "_pages_v" ADD COLUMN IF NOT EXISTS "version_page_template" varchar DEFAULT 'default';
    ALTER TABLE "_pages_v" ADD COLUMN IF NOT EXISTS "version_global_css_overlay" varchar;
    ALTER TABLE "_pages_v" ADD COLUMN IF NOT EXISTS "version_layout_css_overlay" varchar;
  `)

  // ── 2b. Convert page_template to proper ENUM if still varchar ──────
  await db.execute(sql`
    DO $$ BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'pages'
          AND column_name = 'page_template' AND data_type = 'character varying'
      ) THEN
        ALTER TABLE "pages"
          ALTER COLUMN "page_template" SET DATA TYPE "public"."enum_pages_page_template"
          USING COALESCE("page_template", 'default')::"public"."enum_pages_page_template";
        ALTER TABLE "pages"
          ALTER COLUMN "page_template" SET DEFAULT 'default'::"public"."enum_pages_page_template";
      END IF;
    END $$;

    DO $$ BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = '_pages_v'
          AND column_name = 'version_page_template' AND data_type = 'character varying'
      ) THEN
        ALTER TABLE "_pages_v"
          ALTER COLUMN "version_page_template" SET DATA TYPE "public"."enum__pages_v_version_page_template"
          USING COALESCE("version_page_template", 'default')::"public"."enum__pages_v_version_page_template";
        ALTER TABLE "_pages_v"
          ALTER COLUMN "version_page_template" SET DEFAULT 'default'::"public"."enum__pages_v_version_page_template";
      END IF;
    END $$;
  `)

  // ── 3. Visual-editor columns on non-versioned block tables ─────────
  await db.execute(sql`
    ALTER TABLE "pages_blocks_hero" ADD COLUMN IF NOT EXISTS "animation" varchar;
    ALTER TABLE "pages_blocks_hero" ADD COLUMN IF NOT EXISTS "animation_duration" numeric;
    ALTER TABLE "pages_blocks_hero" ADD COLUMN IF NOT EXISTS "animation_delay" numeric;
    ALTER TABLE "pages_blocks_hero" ADD COLUMN IF NOT EXISTS "animation_easing" varchar;
    ALTER TABLE "pages_blocks_hero" ADD COLUMN IF NOT EXISTS "animation_iterations" varchar;
    ALTER TABLE "pages_blocks_hero" ADD COLUMN IF NOT EXISTS "style_overrides" jsonb;

    ALTER TABLE "pages_blocks_stats" ADD COLUMN IF NOT EXISTS "animation" varchar;
    ALTER TABLE "pages_blocks_stats" ADD COLUMN IF NOT EXISTS "animation_duration" numeric;
    ALTER TABLE "pages_blocks_stats" ADD COLUMN IF NOT EXISTS "animation_delay" numeric;
    ALTER TABLE "pages_blocks_stats" ADD COLUMN IF NOT EXISTS "animation_easing" varchar;
    ALTER TABLE "pages_blocks_stats" ADD COLUMN IF NOT EXISTS "animation_iterations" varchar;
    ALTER TABLE "pages_blocks_stats" ADD COLUMN IF NOT EXISTS "style_overrides" jsonb;

    ALTER TABLE "pages_blocks_services" ADD COLUMN IF NOT EXISTS "animation" varchar;
    ALTER TABLE "pages_blocks_services" ADD COLUMN IF NOT EXISTS "animation_duration" numeric;
    ALTER TABLE "pages_blocks_services" ADD COLUMN IF NOT EXISTS "animation_delay" numeric;
    ALTER TABLE "pages_blocks_services" ADD COLUMN IF NOT EXISTS "animation_easing" varchar;
    ALTER TABLE "pages_blocks_services" ADD COLUMN IF NOT EXISTS "animation_iterations" varchar;
    ALTER TABLE "pages_blocks_services" ADD COLUMN IF NOT EXISTS "style_overrides" jsonb;

    ALTER TABLE "pages_blocks_featured_products" ADD COLUMN IF NOT EXISTS "animation" varchar;
    ALTER TABLE "pages_blocks_featured_products" ADD COLUMN IF NOT EXISTS "animation_duration" numeric;
    ALTER TABLE "pages_blocks_featured_products" ADD COLUMN IF NOT EXISTS "animation_delay" numeric;
    ALTER TABLE "pages_blocks_featured_products" ADD COLUMN IF NOT EXISTS "animation_easing" varchar;
    ALTER TABLE "pages_blocks_featured_products" ADD COLUMN IF NOT EXISTS "animation_iterations" varchar;
    ALTER TABLE "pages_blocks_featured_products" ADD COLUMN IF NOT EXISTS "style_overrides" jsonb;

    ALTER TABLE "pages_blocks_about" ADD COLUMN IF NOT EXISTS "animation" varchar;
    ALTER TABLE "pages_blocks_about" ADD COLUMN IF NOT EXISTS "animation_duration" numeric;
    ALTER TABLE "pages_blocks_about" ADD COLUMN IF NOT EXISTS "animation_delay" numeric;
    ALTER TABLE "pages_blocks_about" ADD COLUMN IF NOT EXISTS "animation_easing" varchar;
    ALTER TABLE "pages_blocks_about" ADD COLUMN IF NOT EXISTS "animation_iterations" varchar;
    ALTER TABLE "pages_blocks_about" ADD COLUMN IF NOT EXISTS "style_overrides" jsonb;

    ALTER TABLE "pages_blocks_rich_text" ADD COLUMN IF NOT EXISTS "animation" varchar;
    ALTER TABLE "pages_blocks_rich_text" ADD COLUMN IF NOT EXISTS "animation_duration" numeric;
    ALTER TABLE "pages_blocks_rich_text" ADD COLUMN IF NOT EXISTS "animation_delay" numeric;
    ALTER TABLE "pages_blocks_rich_text" ADD COLUMN IF NOT EXISTS "animation_easing" varchar;
    ALTER TABLE "pages_blocks_rich_text" ADD COLUMN IF NOT EXISTS "animation_iterations" varchar;
    ALTER TABLE "pages_blocks_rich_text" ADD COLUMN IF NOT EXISTS "style_overrides" jsonb;

    ALTER TABLE "pages_blocks_gallery" ADD COLUMN IF NOT EXISTS "animation" varchar;
    ALTER TABLE "pages_blocks_gallery" ADD COLUMN IF NOT EXISTS "animation_duration" numeric;
    ALTER TABLE "pages_blocks_gallery" ADD COLUMN IF NOT EXISTS "animation_delay" numeric;
    ALTER TABLE "pages_blocks_gallery" ADD COLUMN IF NOT EXISTS "animation_easing" varchar;
    ALTER TABLE "pages_blocks_gallery" ADD COLUMN IF NOT EXISTS "animation_iterations" varchar;
    ALTER TABLE "pages_blocks_gallery" ADD COLUMN IF NOT EXISTS "style_overrides" jsonb;

    ALTER TABLE "pages_blocks_gallery_full" ADD COLUMN IF NOT EXISTS "animation" varchar;
    ALTER TABLE "pages_blocks_gallery_full" ADD COLUMN IF NOT EXISTS "animation_duration" numeric;
    ALTER TABLE "pages_blocks_gallery_full" ADD COLUMN IF NOT EXISTS "animation_delay" numeric;
    ALTER TABLE "pages_blocks_gallery_full" ADD COLUMN IF NOT EXISTS "animation_easing" varchar;
    ALTER TABLE "pages_blocks_gallery_full" ADD COLUMN IF NOT EXISTS "animation_iterations" varchar;
    ALTER TABLE "pages_blocks_gallery_full" ADD COLUMN IF NOT EXISTS "style_overrides" jsonb;

    ALTER TABLE "pages_blocks_testimonials" ADD COLUMN IF NOT EXISTS "animation" varchar;
    ALTER TABLE "pages_blocks_testimonials" ADD COLUMN IF NOT EXISTS "animation_duration" numeric;
    ALTER TABLE "pages_blocks_testimonials" ADD COLUMN IF NOT EXISTS "animation_delay" numeric;
    ALTER TABLE "pages_blocks_testimonials" ADD COLUMN IF NOT EXISTS "animation_easing" varchar;
    ALTER TABLE "pages_blocks_testimonials" ADD COLUMN IF NOT EXISTS "animation_iterations" varchar;
    ALTER TABLE "pages_blocks_testimonials" ADD COLUMN IF NOT EXISTS "style_overrides" jsonb;

    ALTER TABLE "pages_blocks_cta" ADD COLUMN IF NOT EXISTS "animation" varchar;
    ALTER TABLE "pages_blocks_cta" ADD COLUMN IF NOT EXISTS "animation_duration" numeric;
    ALTER TABLE "pages_blocks_cta" ADD COLUMN IF NOT EXISTS "animation_delay" numeric;
    ALTER TABLE "pages_blocks_cta" ADD COLUMN IF NOT EXISTS "animation_easing" varchar;
    ALTER TABLE "pages_blocks_cta" ADD COLUMN IF NOT EXISTS "animation_iterations" varchar;
    ALTER TABLE "pages_blocks_cta" ADD COLUMN IF NOT EXISTS "style_overrides" jsonb;

    ALTER TABLE "pages_blocks_faq" ADD COLUMN IF NOT EXISTS "animation" varchar;
    ALTER TABLE "pages_blocks_faq" ADD COLUMN IF NOT EXISTS "animation_duration" numeric;
    ALTER TABLE "pages_blocks_faq" ADD COLUMN IF NOT EXISTS "animation_delay" numeric;
    ALTER TABLE "pages_blocks_faq" ADD COLUMN IF NOT EXISTS "animation_easing" varchar;
    ALTER TABLE "pages_blocks_faq" ADD COLUMN IF NOT EXISTS "animation_iterations" varchar;
    ALTER TABLE "pages_blocks_faq" ADD COLUMN IF NOT EXISTS "style_overrides" jsonb;

    ALTER TABLE "pages_blocks_pricing" ADD COLUMN IF NOT EXISTS "animation" varchar;
    ALTER TABLE "pages_blocks_pricing" ADD COLUMN IF NOT EXISTS "animation_duration" numeric;
    ALTER TABLE "pages_blocks_pricing" ADD COLUMN IF NOT EXISTS "animation_delay" numeric;
    ALTER TABLE "pages_blocks_pricing" ADD COLUMN IF NOT EXISTS "animation_easing" varchar;
    ALTER TABLE "pages_blocks_pricing" ADD COLUMN IF NOT EXISTS "animation_iterations" varchar;
    ALTER TABLE "pages_blocks_pricing" ADD COLUMN IF NOT EXISTS "style_overrides" jsonb;

    ALTER TABLE "pages_blocks_steps" ADD COLUMN IF NOT EXISTS "animation" varchar;
    ALTER TABLE "pages_blocks_steps" ADD COLUMN IF NOT EXISTS "animation_duration" numeric;
    ALTER TABLE "pages_blocks_steps" ADD COLUMN IF NOT EXISTS "animation_delay" numeric;
    ALTER TABLE "pages_blocks_steps" ADD COLUMN IF NOT EXISTS "animation_easing" varchar;
    ALTER TABLE "pages_blocks_steps" ADD COLUMN IF NOT EXISTS "animation_iterations" varchar;
    ALTER TABLE "pages_blocks_steps" ADD COLUMN IF NOT EXISTS "style_overrides" jsonb;

    ALTER TABLE "pages_blocks_contact_form" ADD COLUMN IF NOT EXISTS "animation" varchar;
    ALTER TABLE "pages_blocks_contact_form" ADD COLUMN IF NOT EXISTS "animation_duration" numeric;
    ALTER TABLE "pages_blocks_contact_form" ADD COLUMN IF NOT EXISTS "animation_delay" numeric;
    ALTER TABLE "pages_blocks_contact_form" ADD COLUMN IF NOT EXISTS "animation_easing" varchar;
    ALTER TABLE "pages_blocks_contact_form" ADD COLUMN IF NOT EXISTS "animation_iterations" varchar;
    ALTER TABLE "pages_blocks_contact_form" ADD COLUMN IF NOT EXISTS "style_overrides" jsonb;

    ALTER TABLE "pages_blocks_legal_text" ADD COLUMN IF NOT EXISTS "animation" varchar;
    ALTER TABLE "pages_blocks_legal_text" ADD COLUMN IF NOT EXISTS "animation_duration" numeric;
    ALTER TABLE "pages_blocks_legal_text" ADD COLUMN IF NOT EXISTS "animation_delay" numeric;
    ALTER TABLE "pages_blocks_legal_text" ADD COLUMN IF NOT EXISTS "animation_easing" varchar;
    ALTER TABLE "pages_blocks_legal_text" ADD COLUMN IF NOT EXISTS "animation_iterations" varchar;
    ALTER TABLE "pages_blocks_legal_text" ADD COLUMN IF NOT EXISTS "style_overrides" jsonb;

    ALTER TABLE "pages_blocks_partners" ADD COLUMN IF NOT EXISTS "animation" varchar;
    ALTER TABLE "pages_blocks_partners" ADD COLUMN IF NOT EXISTS "animation_duration" numeric;
    ALTER TABLE "pages_blocks_partners" ADD COLUMN IF NOT EXISTS "animation_delay" numeric;
    ALTER TABLE "pages_blocks_partners" ADD COLUMN IF NOT EXISTS "animation_easing" varchar;
    ALTER TABLE "pages_blocks_partners" ADD COLUMN IF NOT EXISTS "animation_iterations" varchar;
    ALTER TABLE "pages_blocks_partners" ADD COLUMN IF NOT EXISTS "style_overrides" jsonb;

    ALTER TABLE "pages_blocks_team" ADD COLUMN IF NOT EXISTS "animation" varchar;
    ALTER TABLE "pages_blocks_team" ADD COLUMN IF NOT EXISTS "animation_duration" numeric;
    ALTER TABLE "pages_blocks_team" ADD COLUMN IF NOT EXISTS "animation_delay" numeric;
    ALTER TABLE "pages_blocks_team" ADD COLUMN IF NOT EXISTS "animation_easing" varchar;
    ALTER TABLE "pages_blocks_team" ADD COLUMN IF NOT EXISTS "animation_iterations" varchar;
    ALTER TABLE "pages_blocks_team" ADD COLUMN IF NOT EXISTS "style_overrides" jsonb;

    ALTER TABLE "pages_blocks_map_area" ADD COLUMN IF NOT EXISTS "animation" varchar;
    ALTER TABLE "pages_blocks_map_area" ADD COLUMN IF NOT EXISTS "animation_duration" numeric;
    ALTER TABLE "pages_blocks_map_area" ADD COLUMN IF NOT EXISTS "animation_delay" numeric;
    ALTER TABLE "pages_blocks_map_area" ADD COLUMN IF NOT EXISTS "animation_easing" varchar;
    ALTER TABLE "pages_blocks_map_area" ADD COLUMN IF NOT EXISTS "animation_iterations" varchar;
    ALTER TABLE "pages_blocks_map_area" ADD COLUMN IF NOT EXISTS "style_overrides" jsonb;

    ALTER TABLE "pages_blocks_offer_cards" ADD COLUMN IF NOT EXISTS "animation" varchar;
    ALTER TABLE "pages_blocks_offer_cards" ADD COLUMN IF NOT EXISTS "animation_duration" numeric;
    ALTER TABLE "pages_blocks_offer_cards" ADD COLUMN IF NOT EXISTS "animation_delay" numeric;
    ALTER TABLE "pages_blocks_offer_cards" ADD COLUMN IF NOT EXISTS "animation_easing" varchar;
    ALTER TABLE "pages_blocks_offer_cards" ADD COLUMN IF NOT EXISTS "animation_iterations" varchar;
    ALTER TABLE "pages_blocks_offer_cards" ADD COLUMN IF NOT EXISTS "style_overrides" jsonb;
  `)

  // ── 4. Visual-editor columns on versioned block tables ─────────────
  await db.execute(sql`
    ALTER TABLE "_pages_v_blocks_hero" ADD COLUMN IF NOT EXISTS "animation" varchar;
    ALTER TABLE "_pages_v_blocks_hero" ADD COLUMN IF NOT EXISTS "animation_duration" numeric;
    ALTER TABLE "_pages_v_blocks_hero" ADD COLUMN IF NOT EXISTS "animation_delay" numeric;
    ALTER TABLE "_pages_v_blocks_hero" ADD COLUMN IF NOT EXISTS "animation_easing" varchar;
    ALTER TABLE "_pages_v_blocks_hero" ADD COLUMN IF NOT EXISTS "animation_iterations" varchar;
    ALTER TABLE "_pages_v_blocks_hero" ADD COLUMN IF NOT EXISTS "style_overrides" jsonb;

    ALTER TABLE "_pages_v_blocks_stats" ADD COLUMN IF NOT EXISTS "animation" varchar;
    ALTER TABLE "_pages_v_blocks_stats" ADD COLUMN IF NOT EXISTS "animation_duration" numeric;
    ALTER TABLE "_pages_v_blocks_stats" ADD COLUMN IF NOT EXISTS "animation_delay" numeric;
    ALTER TABLE "_pages_v_blocks_stats" ADD COLUMN IF NOT EXISTS "animation_easing" varchar;
    ALTER TABLE "_pages_v_blocks_stats" ADD COLUMN IF NOT EXISTS "animation_iterations" varchar;
    ALTER TABLE "_pages_v_blocks_stats" ADD COLUMN IF NOT EXISTS "style_overrides" jsonb;

    ALTER TABLE "_pages_v_blocks_services" ADD COLUMN IF NOT EXISTS "animation" varchar;
    ALTER TABLE "_pages_v_blocks_services" ADD COLUMN IF NOT EXISTS "animation_duration" numeric;
    ALTER TABLE "_pages_v_blocks_services" ADD COLUMN IF NOT EXISTS "animation_delay" numeric;
    ALTER TABLE "_pages_v_blocks_services" ADD COLUMN IF NOT EXISTS "animation_easing" varchar;
    ALTER TABLE "_pages_v_blocks_services" ADD COLUMN IF NOT EXISTS "animation_iterations" varchar;
    ALTER TABLE "_pages_v_blocks_services" ADD COLUMN IF NOT EXISTS "style_overrides" jsonb;

    ALTER TABLE "_pages_v_blocks_featured_products" ADD COLUMN IF NOT EXISTS "animation" varchar;
    ALTER TABLE "_pages_v_blocks_featured_products" ADD COLUMN IF NOT EXISTS "animation_duration" numeric;
    ALTER TABLE "_pages_v_blocks_featured_products" ADD COLUMN IF NOT EXISTS "animation_delay" numeric;
    ALTER TABLE "_pages_v_blocks_featured_products" ADD COLUMN IF NOT EXISTS "animation_easing" varchar;
    ALTER TABLE "_pages_v_blocks_featured_products" ADD COLUMN IF NOT EXISTS "animation_iterations" varchar;
    ALTER TABLE "_pages_v_blocks_featured_products" ADD COLUMN IF NOT EXISTS "style_overrides" jsonb;

    ALTER TABLE "_pages_v_blocks_about" ADD COLUMN IF NOT EXISTS "animation" varchar;
    ALTER TABLE "_pages_v_blocks_about" ADD COLUMN IF NOT EXISTS "animation_duration" numeric;
    ALTER TABLE "_pages_v_blocks_about" ADD COLUMN IF NOT EXISTS "animation_delay" numeric;
    ALTER TABLE "_pages_v_blocks_about" ADD COLUMN IF NOT EXISTS "animation_easing" varchar;
    ALTER TABLE "_pages_v_blocks_about" ADD COLUMN IF NOT EXISTS "animation_iterations" varchar;
    ALTER TABLE "_pages_v_blocks_about" ADD COLUMN IF NOT EXISTS "style_overrides" jsonb;

    ALTER TABLE "_pages_v_blocks_rich_text" ADD COLUMN IF NOT EXISTS "animation" varchar;
    ALTER TABLE "_pages_v_blocks_rich_text" ADD COLUMN IF NOT EXISTS "animation_duration" numeric;
    ALTER TABLE "_pages_v_blocks_rich_text" ADD COLUMN IF NOT EXISTS "animation_delay" numeric;
    ALTER TABLE "_pages_v_blocks_rich_text" ADD COLUMN IF NOT EXISTS "animation_easing" varchar;
    ALTER TABLE "_pages_v_blocks_rich_text" ADD COLUMN IF NOT EXISTS "animation_iterations" varchar;
    ALTER TABLE "_pages_v_blocks_rich_text" ADD COLUMN IF NOT EXISTS "style_overrides" jsonb;

    ALTER TABLE "_pages_v_blocks_gallery" ADD COLUMN IF NOT EXISTS "animation" varchar;
    ALTER TABLE "_pages_v_blocks_gallery" ADD COLUMN IF NOT EXISTS "animation_duration" numeric;
    ALTER TABLE "_pages_v_blocks_gallery" ADD COLUMN IF NOT EXISTS "animation_delay" numeric;
    ALTER TABLE "_pages_v_blocks_gallery" ADD COLUMN IF NOT EXISTS "animation_easing" varchar;
    ALTER TABLE "_pages_v_blocks_gallery" ADD COLUMN IF NOT EXISTS "animation_iterations" varchar;
    ALTER TABLE "_pages_v_blocks_gallery" ADD COLUMN IF NOT EXISTS "style_overrides" jsonb;

    ALTER TABLE "_pages_v_blocks_gallery_full" ADD COLUMN IF NOT EXISTS "animation" varchar;
    ALTER TABLE "_pages_v_blocks_gallery_full" ADD COLUMN IF NOT EXISTS "animation_duration" numeric;
    ALTER TABLE "_pages_v_blocks_gallery_full" ADD COLUMN IF NOT EXISTS "animation_delay" numeric;
    ALTER TABLE "_pages_v_blocks_gallery_full" ADD COLUMN IF NOT EXISTS "animation_easing" varchar;
    ALTER TABLE "_pages_v_blocks_gallery_full" ADD COLUMN IF NOT EXISTS "animation_iterations" varchar;
    ALTER TABLE "_pages_v_blocks_gallery_full" ADD COLUMN IF NOT EXISTS "style_overrides" jsonb;

    ALTER TABLE "_pages_v_blocks_testimonials" ADD COLUMN IF NOT EXISTS "animation" varchar;
    ALTER TABLE "_pages_v_blocks_testimonials" ADD COLUMN IF NOT EXISTS "animation_duration" numeric;
    ALTER TABLE "_pages_v_blocks_testimonials" ADD COLUMN IF NOT EXISTS "animation_delay" numeric;
    ALTER TABLE "_pages_v_blocks_testimonials" ADD COLUMN IF NOT EXISTS "animation_easing" varchar;
    ALTER TABLE "_pages_v_blocks_testimonials" ADD COLUMN IF NOT EXISTS "animation_iterations" varchar;
    ALTER TABLE "_pages_v_blocks_testimonials" ADD COLUMN IF NOT EXISTS "style_overrides" jsonb;

    ALTER TABLE "_pages_v_blocks_cta" ADD COLUMN IF NOT EXISTS "animation" varchar;
    ALTER TABLE "_pages_v_blocks_cta" ADD COLUMN IF NOT EXISTS "animation_duration" numeric;
    ALTER TABLE "_pages_v_blocks_cta" ADD COLUMN IF NOT EXISTS "animation_delay" numeric;
    ALTER TABLE "_pages_v_blocks_cta" ADD COLUMN IF NOT EXISTS "animation_easing" varchar;
    ALTER TABLE "_pages_v_blocks_cta" ADD COLUMN IF NOT EXISTS "animation_iterations" varchar;
    ALTER TABLE "_pages_v_blocks_cta" ADD COLUMN IF NOT EXISTS "style_overrides" jsonb;

    ALTER TABLE "_pages_v_blocks_faq" ADD COLUMN IF NOT EXISTS "animation" varchar;
    ALTER TABLE "_pages_v_blocks_faq" ADD COLUMN IF NOT EXISTS "animation_duration" numeric;
    ALTER TABLE "_pages_v_blocks_faq" ADD COLUMN IF NOT EXISTS "animation_delay" numeric;
    ALTER TABLE "_pages_v_blocks_faq" ADD COLUMN IF NOT EXISTS "animation_easing" varchar;
    ALTER TABLE "_pages_v_blocks_faq" ADD COLUMN IF NOT EXISTS "animation_iterations" varchar;
    ALTER TABLE "_pages_v_blocks_faq" ADD COLUMN IF NOT EXISTS "style_overrides" jsonb;

    ALTER TABLE "_pages_v_blocks_pricing" ADD COLUMN IF NOT EXISTS "animation" varchar;
    ALTER TABLE "_pages_v_blocks_pricing" ADD COLUMN IF NOT EXISTS "animation_duration" numeric;
    ALTER TABLE "_pages_v_blocks_pricing" ADD COLUMN IF NOT EXISTS "animation_delay" numeric;
    ALTER TABLE "_pages_v_blocks_pricing" ADD COLUMN IF NOT EXISTS "animation_easing" varchar;
    ALTER TABLE "_pages_v_blocks_pricing" ADD COLUMN IF NOT EXISTS "animation_iterations" varchar;
    ALTER TABLE "_pages_v_blocks_pricing" ADD COLUMN IF NOT EXISTS "style_overrides" jsonb;

    ALTER TABLE "_pages_v_blocks_steps" ADD COLUMN IF NOT EXISTS "animation" varchar;
    ALTER TABLE "_pages_v_blocks_steps" ADD COLUMN IF NOT EXISTS "animation_duration" numeric;
    ALTER TABLE "_pages_v_blocks_steps" ADD COLUMN IF NOT EXISTS "animation_delay" numeric;
    ALTER TABLE "_pages_v_blocks_steps" ADD COLUMN IF NOT EXISTS "animation_easing" varchar;
    ALTER TABLE "_pages_v_blocks_steps" ADD COLUMN IF NOT EXISTS "animation_iterations" varchar;
    ALTER TABLE "_pages_v_blocks_steps" ADD COLUMN IF NOT EXISTS "style_overrides" jsonb;

    ALTER TABLE "_pages_v_blocks_contact_form" ADD COLUMN IF NOT EXISTS "animation" varchar;
    ALTER TABLE "_pages_v_blocks_contact_form" ADD COLUMN IF NOT EXISTS "animation_duration" numeric;
    ALTER TABLE "_pages_v_blocks_contact_form" ADD COLUMN IF NOT EXISTS "animation_delay" numeric;
    ALTER TABLE "_pages_v_blocks_contact_form" ADD COLUMN IF NOT EXISTS "animation_easing" varchar;
    ALTER TABLE "_pages_v_blocks_contact_form" ADD COLUMN IF NOT EXISTS "animation_iterations" varchar;
    ALTER TABLE "_pages_v_blocks_contact_form" ADD COLUMN IF NOT EXISTS "style_overrides" jsonb;

    ALTER TABLE "_pages_v_blocks_legal_text" ADD COLUMN IF NOT EXISTS "animation" varchar;
    ALTER TABLE "_pages_v_blocks_legal_text" ADD COLUMN IF NOT EXISTS "animation_duration" numeric;
    ALTER TABLE "_pages_v_blocks_legal_text" ADD COLUMN IF NOT EXISTS "animation_delay" numeric;
    ALTER TABLE "_pages_v_blocks_legal_text" ADD COLUMN IF NOT EXISTS "animation_easing" varchar;
    ALTER TABLE "_pages_v_blocks_legal_text" ADD COLUMN IF NOT EXISTS "animation_iterations" varchar;
    ALTER TABLE "_pages_v_blocks_legal_text" ADD COLUMN IF NOT EXISTS "style_overrides" jsonb;

    ALTER TABLE "_pages_v_blocks_partners" ADD COLUMN IF NOT EXISTS "animation" varchar;
    ALTER TABLE "_pages_v_blocks_partners" ADD COLUMN IF NOT EXISTS "animation_duration" numeric;
    ALTER TABLE "_pages_v_blocks_partners" ADD COLUMN IF NOT EXISTS "animation_delay" numeric;
    ALTER TABLE "_pages_v_blocks_partners" ADD COLUMN IF NOT EXISTS "animation_easing" varchar;
    ALTER TABLE "_pages_v_blocks_partners" ADD COLUMN IF NOT EXISTS "animation_iterations" varchar;
    ALTER TABLE "_pages_v_blocks_partners" ADD COLUMN IF NOT EXISTS "style_overrides" jsonb;

    ALTER TABLE "_pages_v_blocks_team" ADD COLUMN IF NOT EXISTS "animation" varchar;
    ALTER TABLE "_pages_v_blocks_team" ADD COLUMN IF NOT EXISTS "animation_duration" numeric;
    ALTER TABLE "_pages_v_blocks_team" ADD COLUMN IF NOT EXISTS "animation_delay" numeric;
    ALTER TABLE "_pages_v_blocks_team" ADD COLUMN IF NOT EXISTS "animation_easing" varchar;
    ALTER TABLE "_pages_v_blocks_team" ADD COLUMN IF NOT EXISTS "animation_iterations" varchar;
    ALTER TABLE "_pages_v_blocks_team" ADD COLUMN IF NOT EXISTS "style_overrides" jsonb;

    ALTER TABLE "_pages_v_blocks_map_area" ADD COLUMN IF NOT EXISTS "animation" varchar;
    ALTER TABLE "_pages_v_blocks_map_area" ADD COLUMN IF NOT EXISTS "animation_duration" numeric;
    ALTER TABLE "_pages_v_blocks_map_area" ADD COLUMN IF NOT EXISTS "animation_delay" numeric;
    ALTER TABLE "_pages_v_blocks_map_area" ADD COLUMN IF NOT EXISTS "animation_easing" varchar;
    ALTER TABLE "_pages_v_blocks_map_area" ADD COLUMN IF NOT EXISTS "animation_iterations" varchar;
    ALTER TABLE "_pages_v_blocks_map_area" ADD COLUMN IF NOT EXISTS "style_overrides" jsonb;

    ALTER TABLE "_pages_v_blocks_offer_cards" ADD COLUMN IF NOT EXISTS "animation" varchar;
    ALTER TABLE "_pages_v_blocks_offer_cards" ADD COLUMN IF NOT EXISTS "animation_duration" numeric;
    ALTER TABLE "_pages_v_blocks_offer_cards" ADD COLUMN IF NOT EXISTS "animation_delay" numeric;
    ALTER TABLE "_pages_v_blocks_offer_cards" ADD COLUMN IF NOT EXISTS "animation_easing" varchar;
    ALTER TABLE "_pages_v_blocks_offer_cards" ADD COLUMN IF NOT EXISTS "animation_iterations" varchar;
    ALTER TABLE "_pages_v_blocks_offer_cards" ADD COLUMN IF NOT EXISTS "style_overrides" jsonb;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "pages_blocks_hero" DROP COLUMN IF EXISTS "animation";
    ALTER TABLE "pages_blocks_hero" DROP COLUMN IF EXISTS "animation_duration";
    ALTER TABLE "pages_blocks_hero" DROP COLUMN IF EXISTS "animation_delay";
    ALTER TABLE "pages_blocks_hero" DROP COLUMN IF EXISTS "animation_easing";
    ALTER TABLE "pages_blocks_hero" DROP COLUMN IF EXISTS "animation_iterations";
    ALTER TABLE "pages_blocks_hero" DROP COLUMN IF EXISTS "style_overrides";

    ALTER TABLE "pages_blocks_stats" DROP COLUMN IF EXISTS "animation";
    ALTER TABLE "pages_blocks_stats" DROP COLUMN IF EXISTS "animation_duration";
    ALTER TABLE "pages_blocks_stats" DROP COLUMN IF EXISTS "animation_delay";
    ALTER TABLE "pages_blocks_stats" DROP COLUMN IF EXISTS "animation_easing";
    ALTER TABLE "pages_blocks_stats" DROP COLUMN IF EXISTS "animation_iterations";
    ALTER TABLE "pages_blocks_stats" DROP COLUMN IF EXISTS "style_overrides";

    ALTER TABLE "pages_blocks_services" DROP COLUMN IF EXISTS "animation";
    ALTER TABLE "pages_blocks_services" DROP COLUMN IF EXISTS "animation_duration";
    ALTER TABLE "pages_blocks_services" DROP COLUMN IF EXISTS "animation_delay";
    ALTER TABLE "pages_blocks_services" DROP COLUMN IF EXISTS "animation_easing";
    ALTER TABLE "pages_blocks_services" DROP COLUMN IF EXISTS "animation_iterations";
    ALTER TABLE "pages_blocks_services" DROP COLUMN IF EXISTS "style_overrides";

    ALTER TABLE "pages_blocks_featured_products" DROP COLUMN IF EXISTS "animation";
    ALTER TABLE "pages_blocks_featured_products" DROP COLUMN IF EXISTS "animation_duration";
    ALTER TABLE "pages_blocks_featured_products" DROP COLUMN IF EXISTS "animation_delay";
    ALTER TABLE "pages_blocks_featured_products" DROP COLUMN IF EXISTS "animation_easing";
    ALTER TABLE "pages_blocks_featured_products" DROP COLUMN IF EXISTS "animation_iterations";
    ALTER TABLE "pages_blocks_featured_products" DROP COLUMN IF EXISTS "style_overrides";

    ALTER TABLE "pages_blocks_about" DROP COLUMN IF EXISTS "animation";
    ALTER TABLE "pages_blocks_about" DROP COLUMN IF EXISTS "animation_duration";
    ALTER TABLE "pages_blocks_about" DROP COLUMN IF EXISTS "animation_delay";
    ALTER TABLE "pages_blocks_about" DROP COLUMN IF EXISTS "animation_easing";
    ALTER TABLE "pages_blocks_about" DROP COLUMN IF EXISTS "animation_iterations";
    ALTER TABLE "pages_blocks_about" DROP COLUMN IF EXISTS "style_overrides";

    ALTER TABLE "pages_blocks_rich_text" DROP COLUMN IF EXISTS "animation";
    ALTER TABLE "pages_blocks_rich_text" DROP COLUMN IF EXISTS "animation_duration";
    ALTER TABLE "pages_blocks_rich_text" DROP COLUMN IF EXISTS "animation_delay";
    ALTER TABLE "pages_blocks_rich_text" DROP COLUMN IF EXISTS "animation_easing";
    ALTER TABLE "pages_blocks_rich_text" DROP COLUMN IF EXISTS "animation_iterations";
    ALTER TABLE "pages_blocks_rich_text" DROP COLUMN IF EXISTS "style_overrides";

    ALTER TABLE "pages_blocks_gallery" DROP COLUMN IF EXISTS "animation";
    ALTER TABLE "pages_blocks_gallery" DROP COLUMN IF EXISTS "animation_duration";
    ALTER TABLE "pages_blocks_gallery" DROP COLUMN IF EXISTS "animation_delay";
    ALTER TABLE "pages_blocks_gallery" DROP COLUMN IF EXISTS "animation_easing";
    ALTER TABLE "pages_blocks_gallery" DROP COLUMN IF EXISTS "animation_iterations";
    ALTER TABLE "pages_blocks_gallery" DROP COLUMN IF EXISTS "style_overrides";

    ALTER TABLE "pages_blocks_gallery_full" DROP COLUMN IF EXISTS "animation";
    ALTER TABLE "pages_blocks_gallery_full" DROP COLUMN IF EXISTS "animation_duration";
    ALTER TABLE "pages_blocks_gallery_full" DROP COLUMN IF EXISTS "animation_delay";
    ALTER TABLE "pages_blocks_gallery_full" DROP COLUMN IF EXISTS "animation_easing";
    ALTER TABLE "pages_blocks_gallery_full" DROP COLUMN IF EXISTS "animation_iterations";
    ALTER TABLE "pages_blocks_gallery_full" DROP COLUMN IF EXISTS "style_overrides";

    ALTER TABLE "pages_blocks_testimonials" DROP COLUMN IF EXISTS "animation";
    ALTER TABLE "pages_blocks_testimonials" DROP COLUMN IF EXISTS "animation_duration";
    ALTER TABLE "pages_blocks_testimonials" DROP COLUMN IF EXISTS "animation_delay";
    ALTER TABLE "pages_blocks_testimonials" DROP COLUMN IF EXISTS "animation_easing";
    ALTER TABLE "pages_blocks_testimonials" DROP COLUMN IF EXISTS "animation_iterations";
    ALTER TABLE "pages_blocks_testimonials" DROP COLUMN IF EXISTS "style_overrides";

    ALTER TABLE "pages_blocks_cta" DROP COLUMN IF EXISTS "animation";
    ALTER TABLE "pages_blocks_cta" DROP COLUMN IF EXISTS "animation_duration";
    ALTER TABLE "pages_blocks_cta" DROP COLUMN IF EXISTS "animation_delay";
    ALTER TABLE "pages_blocks_cta" DROP COLUMN IF EXISTS "animation_easing";
    ALTER TABLE "pages_blocks_cta" DROP COLUMN IF EXISTS "animation_iterations";
    ALTER TABLE "pages_blocks_cta" DROP COLUMN IF EXISTS "style_overrides";

    ALTER TABLE "pages_blocks_faq" DROP COLUMN IF EXISTS "animation";
    ALTER TABLE "pages_blocks_faq" DROP COLUMN IF EXISTS "animation_duration";
    ALTER TABLE "pages_blocks_faq" DROP COLUMN IF EXISTS "animation_delay";
    ALTER TABLE "pages_blocks_faq" DROP COLUMN IF EXISTS "animation_easing";
    ALTER TABLE "pages_blocks_faq" DROP COLUMN IF EXISTS "animation_iterations";
    ALTER TABLE "pages_blocks_faq" DROP COLUMN IF EXISTS "style_overrides";

    ALTER TABLE "pages_blocks_pricing" DROP COLUMN IF EXISTS "animation";
    ALTER TABLE "pages_blocks_pricing" DROP COLUMN IF EXISTS "animation_duration";
    ALTER TABLE "pages_blocks_pricing" DROP COLUMN IF EXISTS "animation_delay";
    ALTER TABLE "pages_blocks_pricing" DROP COLUMN IF EXISTS "animation_easing";
    ALTER TABLE "pages_blocks_pricing" DROP COLUMN IF EXISTS "animation_iterations";
    ALTER TABLE "pages_blocks_pricing" DROP COLUMN IF EXISTS "style_overrides";

    ALTER TABLE "pages_blocks_steps" DROP COLUMN IF EXISTS "animation";
    ALTER TABLE "pages_blocks_steps" DROP COLUMN IF EXISTS "animation_duration";
    ALTER TABLE "pages_blocks_steps" DROP COLUMN IF EXISTS "animation_delay";
    ALTER TABLE "pages_blocks_steps" DROP COLUMN IF EXISTS "animation_easing";
    ALTER TABLE "pages_blocks_steps" DROP COLUMN IF EXISTS "animation_iterations";
    ALTER TABLE "pages_blocks_steps" DROP COLUMN IF EXISTS "style_overrides";

    ALTER TABLE "pages_blocks_contact_form" DROP COLUMN IF EXISTS "animation";
    ALTER TABLE "pages_blocks_contact_form" DROP COLUMN IF EXISTS "animation_duration";
    ALTER TABLE "pages_blocks_contact_form" DROP COLUMN IF EXISTS "animation_delay";
    ALTER TABLE "pages_blocks_contact_form" DROP COLUMN IF EXISTS "animation_easing";
    ALTER TABLE "pages_blocks_contact_form" DROP COLUMN IF EXISTS "animation_iterations";
    ALTER TABLE "pages_blocks_contact_form" DROP COLUMN IF EXISTS "style_overrides";

    ALTER TABLE "pages_blocks_legal_text" DROP COLUMN IF EXISTS "animation";
    ALTER TABLE "pages_blocks_legal_text" DROP COLUMN IF EXISTS "animation_duration";
    ALTER TABLE "pages_blocks_legal_text" DROP COLUMN IF EXISTS "animation_delay";
    ALTER TABLE "pages_blocks_legal_text" DROP COLUMN IF EXISTS "animation_easing";
    ALTER TABLE "pages_blocks_legal_text" DROP COLUMN IF EXISTS "animation_iterations";
    ALTER TABLE "pages_blocks_legal_text" DROP COLUMN IF EXISTS "style_overrides";

    ALTER TABLE "pages_blocks_partners" DROP COLUMN IF EXISTS "animation";
    ALTER TABLE "pages_blocks_partners" DROP COLUMN IF EXISTS "animation_duration";
    ALTER TABLE "pages_blocks_partners" DROP COLUMN IF EXISTS "animation_delay";
    ALTER TABLE "pages_blocks_partners" DROP COLUMN IF EXISTS "animation_easing";
    ALTER TABLE "pages_blocks_partners" DROP COLUMN IF EXISTS "animation_iterations";
    ALTER TABLE "pages_blocks_partners" DROP COLUMN IF EXISTS "style_overrides";

    ALTER TABLE "pages_blocks_team" DROP COLUMN IF EXISTS "animation";
    ALTER TABLE "pages_blocks_team" DROP COLUMN IF EXISTS "animation_duration";
    ALTER TABLE "pages_blocks_team" DROP COLUMN IF EXISTS "animation_delay";
    ALTER TABLE "pages_blocks_team" DROP COLUMN IF EXISTS "animation_easing";
    ALTER TABLE "pages_blocks_team" DROP COLUMN IF EXISTS "animation_iterations";
    ALTER TABLE "pages_blocks_team" DROP COLUMN IF EXISTS "style_overrides";

    ALTER TABLE "pages_blocks_map_area" DROP COLUMN IF EXISTS "animation";
    ALTER TABLE "pages_blocks_map_area" DROP COLUMN IF EXISTS "animation_duration";
    ALTER TABLE "pages_blocks_map_area" DROP COLUMN IF EXISTS "animation_delay";
    ALTER TABLE "pages_blocks_map_area" DROP COLUMN IF EXISTS "animation_easing";
    ALTER TABLE "pages_blocks_map_area" DROP COLUMN IF EXISTS "animation_iterations";
    ALTER TABLE "pages_blocks_map_area" DROP COLUMN IF EXISTS "style_overrides";

    ALTER TABLE "pages_blocks_offer_cards" DROP COLUMN IF EXISTS "animation";
    ALTER TABLE "pages_blocks_offer_cards" DROP COLUMN IF EXISTS "animation_duration";
    ALTER TABLE "pages_blocks_offer_cards" DROP COLUMN IF EXISTS "animation_delay";
    ALTER TABLE "pages_blocks_offer_cards" DROP COLUMN IF EXISTS "animation_easing";
    ALTER TABLE "pages_blocks_offer_cards" DROP COLUMN IF EXISTS "animation_iterations";
    ALTER TABLE "pages_blocks_offer_cards" DROP COLUMN IF EXISTS "style_overrides";

    ALTER TABLE "pages" DROP COLUMN IF EXISTS "page_template";
    ALTER TABLE "pages" DROP COLUMN IF EXISTS "global_css_overlay";
    ALTER TABLE "pages" DROP COLUMN IF EXISTS "layout_css_overlay";

    ALTER TABLE "_pages_v_blocks_hero" DROP COLUMN IF EXISTS "animation";
    ALTER TABLE "_pages_v_blocks_hero" DROP COLUMN IF EXISTS "animation_duration";
    ALTER TABLE "_pages_v_blocks_hero" DROP COLUMN IF EXISTS "animation_delay";
    ALTER TABLE "_pages_v_blocks_hero" DROP COLUMN IF EXISTS "animation_easing";
    ALTER TABLE "_pages_v_blocks_hero" DROP COLUMN IF EXISTS "animation_iterations";
    ALTER TABLE "_pages_v_blocks_hero" DROP COLUMN IF EXISTS "style_overrides";

    ALTER TABLE "_pages_v_blocks_stats" DROP COLUMN IF EXISTS "animation";
    ALTER TABLE "_pages_v_blocks_stats" DROP COLUMN IF EXISTS "animation_duration";
    ALTER TABLE "_pages_v_blocks_stats" DROP COLUMN IF EXISTS "animation_delay";
    ALTER TABLE "_pages_v_blocks_stats" DROP COLUMN IF EXISTS "animation_easing";
    ALTER TABLE "_pages_v_blocks_stats" DROP COLUMN IF EXISTS "animation_iterations";
    ALTER TABLE "_pages_v_blocks_stats" DROP COLUMN IF EXISTS "style_overrides";

    ALTER TABLE "_pages_v_blocks_services" DROP COLUMN IF EXISTS "animation";
    ALTER TABLE "_pages_v_blocks_services" DROP COLUMN IF EXISTS "animation_duration";
    ALTER TABLE "_pages_v_blocks_services" DROP COLUMN IF EXISTS "animation_delay";
    ALTER TABLE "_pages_v_blocks_services" DROP COLUMN IF EXISTS "animation_easing";
    ALTER TABLE "_pages_v_blocks_services" DROP COLUMN IF EXISTS "animation_iterations";
    ALTER TABLE "_pages_v_blocks_services" DROP COLUMN IF EXISTS "style_overrides";

    ALTER TABLE "_pages_v_blocks_featured_products" DROP COLUMN IF EXISTS "animation";
    ALTER TABLE "_pages_v_blocks_featured_products" DROP COLUMN IF EXISTS "animation_duration";
    ALTER TABLE "_pages_v_blocks_featured_products" DROP COLUMN IF EXISTS "animation_delay";
    ALTER TABLE "_pages_v_blocks_featured_products" DROP COLUMN IF EXISTS "animation_easing";
    ALTER TABLE "_pages_v_blocks_featured_products" DROP COLUMN IF EXISTS "animation_iterations";
    ALTER TABLE "_pages_v_blocks_featured_products" DROP COLUMN IF EXISTS "style_overrides";

    ALTER TABLE "_pages_v_blocks_about" DROP COLUMN IF EXISTS "animation";
    ALTER TABLE "_pages_v_blocks_about" DROP COLUMN IF EXISTS "animation_duration";
    ALTER TABLE "_pages_v_blocks_about" DROP COLUMN IF EXISTS "animation_delay";
    ALTER TABLE "_pages_v_blocks_about" DROP COLUMN IF EXISTS "animation_easing";
    ALTER TABLE "_pages_v_blocks_about" DROP COLUMN IF EXISTS "animation_iterations";
    ALTER TABLE "_pages_v_blocks_about" DROP COLUMN IF EXISTS "style_overrides";

    ALTER TABLE "_pages_v_blocks_rich_text" DROP COLUMN IF EXISTS "animation";
    ALTER TABLE "_pages_v_blocks_rich_text" DROP COLUMN IF EXISTS "animation_duration";
    ALTER TABLE "_pages_v_blocks_rich_text" DROP COLUMN IF EXISTS "animation_delay";
    ALTER TABLE "_pages_v_blocks_rich_text" DROP COLUMN IF EXISTS "animation_easing";
    ALTER TABLE "_pages_v_blocks_rich_text" DROP COLUMN IF EXISTS "animation_iterations";
    ALTER TABLE "_pages_v_blocks_rich_text" DROP COLUMN IF EXISTS "style_overrides";

    ALTER TABLE "_pages_v_blocks_gallery" DROP COLUMN IF EXISTS "animation";
    ALTER TABLE "_pages_v_blocks_gallery" DROP COLUMN IF EXISTS "animation_duration";
    ALTER TABLE "_pages_v_blocks_gallery" DROP COLUMN IF EXISTS "animation_delay";
    ALTER TABLE "_pages_v_blocks_gallery" DROP COLUMN IF EXISTS "animation_easing";
    ALTER TABLE "_pages_v_blocks_gallery" DROP COLUMN IF EXISTS "animation_iterations";
    ALTER TABLE "_pages_v_blocks_gallery" DROP COLUMN IF EXISTS "style_overrides";

    ALTER TABLE "_pages_v_blocks_gallery_full" DROP COLUMN IF EXISTS "animation";
    ALTER TABLE "_pages_v_blocks_gallery_full" DROP COLUMN IF EXISTS "animation_duration";
    ALTER TABLE "_pages_v_blocks_gallery_full" DROP COLUMN IF EXISTS "animation_delay";
    ALTER TABLE "_pages_v_blocks_gallery_full" DROP COLUMN IF EXISTS "animation_easing";
    ALTER TABLE "_pages_v_blocks_gallery_full" DROP COLUMN IF EXISTS "animation_iterations";
    ALTER TABLE "_pages_v_blocks_gallery_full" DROP COLUMN IF EXISTS "style_overrides";

    ALTER TABLE "_pages_v_blocks_testimonials" DROP COLUMN IF EXISTS "animation";
    ALTER TABLE "_pages_v_blocks_testimonials" DROP COLUMN IF EXISTS "animation_duration";
    ALTER TABLE "_pages_v_blocks_testimonials" DROP COLUMN IF EXISTS "animation_delay";
    ALTER TABLE "_pages_v_blocks_testimonials" DROP COLUMN IF EXISTS "animation_easing";
    ALTER TABLE "_pages_v_blocks_testimonials" DROP COLUMN IF EXISTS "animation_iterations";
    ALTER TABLE "_pages_v_blocks_testimonials" DROP COLUMN IF EXISTS "style_overrides";

    ALTER TABLE "_pages_v_blocks_cta" DROP COLUMN IF EXISTS "animation";
    ALTER TABLE "_pages_v_blocks_cta" DROP COLUMN IF EXISTS "animation_duration";
    ALTER TABLE "_pages_v_blocks_cta" DROP COLUMN IF EXISTS "animation_delay";
    ALTER TABLE "_pages_v_blocks_cta" DROP COLUMN IF EXISTS "animation_easing";
    ALTER TABLE "_pages_v_blocks_cta" DROP COLUMN IF EXISTS "animation_iterations";
    ALTER TABLE "_pages_v_blocks_cta" DROP COLUMN IF EXISTS "style_overrides";

    ALTER TABLE "_pages_v_blocks_faq" DROP COLUMN IF EXISTS "animation";
    ALTER TABLE "_pages_v_blocks_faq" DROP COLUMN IF EXISTS "animation_duration";
    ALTER TABLE "_pages_v_blocks_faq" DROP COLUMN IF EXISTS "animation_delay";
    ALTER TABLE "_pages_v_blocks_faq" DROP COLUMN IF EXISTS "animation_easing";
    ALTER TABLE "_pages_v_blocks_faq" DROP COLUMN IF EXISTS "animation_iterations";
    ALTER TABLE "_pages_v_blocks_faq" DROP COLUMN IF EXISTS "style_overrides";

    ALTER TABLE "_pages_v_blocks_pricing" DROP COLUMN IF EXISTS "animation";
    ALTER TABLE "_pages_v_blocks_pricing" DROP COLUMN IF EXISTS "animation_duration";
    ALTER TABLE "_pages_v_blocks_pricing" DROP COLUMN IF EXISTS "animation_delay";
    ALTER TABLE "_pages_v_blocks_pricing" DROP COLUMN IF EXISTS "animation_easing";
    ALTER TABLE "_pages_v_blocks_pricing" DROP COLUMN IF EXISTS "animation_iterations";
    ALTER TABLE "_pages_v_blocks_pricing" DROP COLUMN IF EXISTS "style_overrides";

    ALTER TABLE "_pages_v_blocks_steps" DROP COLUMN IF EXISTS "animation";
    ALTER TABLE "_pages_v_blocks_steps" DROP COLUMN IF EXISTS "animation_duration";
    ALTER TABLE "_pages_v_blocks_steps" DROP COLUMN IF EXISTS "animation_delay";
    ALTER TABLE "_pages_v_blocks_steps" DROP COLUMN IF EXISTS "animation_easing";
    ALTER TABLE "_pages_v_blocks_steps" DROP COLUMN IF EXISTS "animation_iterations";
    ALTER TABLE "_pages_v_blocks_steps" DROP COLUMN IF EXISTS "style_overrides";

    ALTER TABLE "_pages_v_blocks_contact_form" DROP COLUMN IF EXISTS "animation";
    ALTER TABLE "_pages_v_blocks_contact_form" DROP COLUMN IF EXISTS "animation_duration";
    ALTER TABLE "_pages_v_blocks_contact_form" DROP COLUMN IF EXISTS "animation_delay";
    ALTER TABLE "_pages_v_blocks_contact_form" DROP COLUMN IF EXISTS "animation_easing";
    ALTER TABLE "_pages_v_blocks_contact_form" DROP COLUMN IF EXISTS "animation_iterations";
    ALTER TABLE "_pages_v_blocks_contact_form" DROP COLUMN IF EXISTS "style_overrides";

    ALTER TABLE "_pages_v_blocks_legal_text" DROP COLUMN IF EXISTS "animation";
    ALTER TABLE "_pages_v_blocks_legal_text" DROP COLUMN IF EXISTS "animation_duration";
    ALTER TABLE "_pages_v_blocks_legal_text" DROP COLUMN IF EXISTS "animation_delay";
    ALTER TABLE "_pages_v_blocks_legal_text" DROP COLUMN IF EXISTS "animation_easing";
    ALTER TABLE "_pages_v_blocks_legal_text" DROP COLUMN IF EXISTS "animation_iterations";
    ALTER TABLE "_pages_v_blocks_legal_text" DROP COLUMN IF EXISTS "style_overrides";

    ALTER TABLE "_pages_v_blocks_partners" DROP COLUMN IF EXISTS "animation";
    ALTER TABLE "_pages_v_blocks_partners" DROP COLUMN IF EXISTS "animation_duration";
    ALTER TABLE "_pages_v_blocks_partners" DROP COLUMN IF EXISTS "animation_delay";
    ALTER TABLE "_pages_v_blocks_partners" DROP COLUMN IF EXISTS "animation_easing";
    ALTER TABLE "_pages_v_blocks_partners" DROP COLUMN IF EXISTS "animation_iterations";
    ALTER TABLE "_pages_v_blocks_partners" DROP COLUMN IF EXISTS "style_overrides";

    ALTER TABLE "_pages_v_blocks_team" DROP COLUMN IF EXISTS "animation";
    ALTER TABLE "_pages_v_blocks_team" DROP COLUMN IF EXISTS "animation_duration";
    ALTER TABLE "_pages_v_blocks_team" DROP COLUMN IF EXISTS "animation_delay";
    ALTER TABLE "_pages_v_blocks_team" DROP COLUMN IF EXISTS "animation_easing";
    ALTER TABLE "_pages_v_blocks_team" DROP COLUMN IF EXISTS "animation_iterations";
    ALTER TABLE "_pages_v_blocks_team" DROP COLUMN IF EXISTS "style_overrides";

    ALTER TABLE "_pages_v_blocks_map_area" DROP COLUMN IF EXISTS "animation";
    ALTER TABLE "_pages_v_blocks_map_area" DROP COLUMN IF EXISTS "animation_duration";
    ALTER TABLE "_pages_v_blocks_map_area" DROP COLUMN IF EXISTS "animation_delay";
    ALTER TABLE "_pages_v_blocks_map_area" DROP COLUMN IF EXISTS "animation_easing";
    ALTER TABLE "_pages_v_blocks_map_area" DROP COLUMN IF EXISTS "animation_iterations";
    ALTER TABLE "_pages_v_blocks_map_area" DROP COLUMN IF EXISTS "style_overrides";

    ALTER TABLE "_pages_v_blocks_offer_cards" DROP COLUMN IF EXISTS "animation";
    ALTER TABLE "_pages_v_blocks_offer_cards" DROP COLUMN IF EXISTS "animation_duration";
    ALTER TABLE "_pages_v_blocks_offer_cards" DROP COLUMN IF EXISTS "animation_delay";
    ALTER TABLE "_pages_v_blocks_offer_cards" DROP COLUMN IF EXISTS "animation_easing";
    ALTER TABLE "_pages_v_blocks_offer_cards" DROP COLUMN IF EXISTS "animation_iterations";
    ALTER TABLE "_pages_v_blocks_offer_cards" DROP COLUMN IF EXISTS "style_overrides";

    ALTER TABLE "_pages_v" DROP COLUMN IF EXISTS "version_page_template";
    ALTER TABLE "_pages_v" DROP COLUMN IF EXISTS "version_global_css_overlay";
    ALTER TABLE "_pages_v" DROP COLUMN IF EXISTS "version_layout_css_overlay";

    DROP TYPE IF EXISTS "public"."enum_pages_page_template";
    DROP TYPE IF EXISTS "public"."enum__pages_v_version_page_template";
  `)
}
