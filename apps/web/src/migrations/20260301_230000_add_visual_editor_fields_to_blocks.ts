import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Adds visual-editor columns (animation, animationDuration, animationDelay,
 * animationEasing, animationIterations, styleOverrides) to every
 * pages_blocks_* and _pages_v_blocks_* table.
 *
 * These fields were added to block schemas via visualEditorFields() but the
 * corresponding DB columns were never created, causing:
 *   ERROR: column _pages_v_blocks_hero.animation does not exist
 */

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    -- Non-versioned block tables
    ALTER TABLE "pages_blocks_hero" ADD COLUMN IF NOT EXISTS "animation" varchar;
    ALTER TABLE "pages_blocks_hero" ADD COLUMN IF NOT EXISTS "animation_duration" numeric;
    ALTER TABLE "pages_blocks_hero" ADD COLUMN IF NOT EXISTS "animation_delay" numeric;
    ALTER TABLE "pages_blocks_hero" ADD COLUMN IF NOT EXISTS "animation_easing" varchar;
    ALTER TABLE "pages_blocks_hero" ADD COLUMN IF NOT EXISTS "animation_iterations" varchar;
    ALTER TABLE "pages_blocks_hero" ADD COLUMN IF NOT EXISTS "style_overrides" jsonb;

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

    ALTER TABLE "pages_blocks_testimonials" ADD COLUMN IF NOT EXISTS "animation" varchar;
    ALTER TABLE "pages_blocks_testimonials" ADD COLUMN IF NOT EXISTS "animation_duration" numeric;
    ALTER TABLE "pages_blocks_testimonials" ADD COLUMN IF NOT EXISTS "animation_delay" numeric;
    ALTER TABLE "pages_blocks_testimonials" ADD COLUMN IF NOT EXISTS "animation_easing" varchar;
    ALTER TABLE "pages_blocks_testimonials" ADD COLUMN IF NOT EXISTS "animation_iterations" varchar;
    ALTER TABLE "pages_blocks_testimonials" ADD COLUMN IF NOT EXISTS "style_overrides" jsonb;

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

    ALTER TABLE "pages_blocks_gallery_full" ADD COLUMN IF NOT EXISTS "animation" varchar;
    ALTER TABLE "pages_blocks_gallery_full" ADD COLUMN IF NOT EXISTS "animation_duration" numeric;
    ALTER TABLE "pages_blocks_gallery_full" ADD COLUMN IF NOT EXISTS "animation_delay" numeric;
    ALTER TABLE "pages_blocks_gallery_full" ADD COLUMN IF NOT EXISTS "animation_easing" varchar;
    ALTER TABLE "pages_blocks_gallery_full" ADD COLUMN IF NOT EXISTS "animation_iterations" varchar;
    ALTER TABLE "pages_blocks_gallery_full" ADD COLUMN IF NOT EXISTS "style_overrides" jsonb;

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

    -- Versioned block tables
    ALTER TABLE "_pages_v_blocks_hero" ADD COLUMN IF NOT EXISTS "animation" varchar;
    ALTER TABLE "_pages_v_blocks_hero" ADD COLUMN IF NOT EXISTS "animation_duration" numeric;
    ALTER TABLE "_pages_v_blocks_hero" ADD COLUMN IF NOT EXISTS "animation_delay" numeric;
    ALTER TABLE "_pages_v_blocks_hero" ADD COLUMN IF NOT EXISTS "animation_easing" varchar;
    ALTER TABLE "_pages_v_blocks_hero" ADD COLUMN IF NOT EXISTS "animation_iterations" varchar;
    ALTER TABLE "_pages_v_blocks_hero" ADD COLUMN IF NOT EXISTS "style_overrides" jsonb;

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

    ALTER TABLE "_pages_v_blocks_testimonials" ADD COLUMN IF NOT EXISTS "animation" varchar;
    ALTER TABLE "_pages_v_blocks_testimonials" ADD COLUMN IF NOT EXISTS "animation_duration" numeric;
    ALTER TABLE "_pages_v_blocks_testimonials" ADD COLUMN IF NOT EXISTS "animation_delay" numeric;
    ALTER TABLE "_pages_v_blocks_testimonials" ADD COLUMN IF NOT EXISTS "animation_easing" varchar;
    ALTER TABLE "_pages_v_blocks_testimonials" ADD COLUMN IF NOT EXISTS "animation_iterations" varchar;
    ALTER TABLE "_pages_v_blocks_testimonials" ADD COLUMN IF NOT EXISTS "style_overrides" jsonb;

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

    ALTER TABLE "_pages_v_blocks_gallery_full" ADD COLUMN IF NOT EXISTS "animation" varchar;
    ALTER TABLE "_pages_v_blocks_gallery_full" ADD COLUMN IF NOT EXISTS "animation_duration" numeric;
    ALTER TABLE "_pages_v_blocks_gallery_full" ADD COLUMN IF NOT EXISTS "animation_delay" numeric;
    ALTER TABLE "_pages_v_blocks_gallery_full" ADD COLUMN IF NOT EXISTS "animation_easing" varchar;
    ALTER TABLE "_pages_v_blocks_gallery_full" ADD COLUMN IF NOT EXISTS "animation_iterations" varchar;
    ALTER TABLE "_pages_v_blocks_gallery_full" ADD COLUMN IF NOT EXISTS "style_overrides" jsonb;

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
    -- Non-versioned block tables
    ALTER TABLE "pages_blocks_hero" DROP COLUMN IF EXISTS "animation";
    ALTER TABLE "pages_blocks_hero" DROP COLUMN IF EXISTS "animation_duration";
    ALTER TABLE "pages_blocks_hero" DROP COLUMN IF EXISTS "animation_delay";
    ALTER TABLE "pages_blocks_hero" DROP COLUMN IF EXISTS "animation_easing";
    ALTER TABLE "pages_blocks_hero" DROP COLUMN IF EXISTS "animation_iterations";
    ALTER TABLE "pages_blocks_hero" DROP COLUMN IF EXISTS "style_overrides";

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

    ALTER TABLE "pages_blocks_testimonials" DROP COLUMN IF EXISTS "animation";
    ALTER TABLE "pages_blocks_testimonials" DROP COLUMN IF EXISTS "animation_duration";
    ALTER TABLE "pages_blocks_testimonials" DROP COLUMN IF EXISTS "animation_delay";
    ALTER TABLE "pages_blocks_testimonials" DROP COLUMN IF EXISTS "animation_easing";
    ALTER TABLE "pages_blocks_testimonials" DROP COLUMN IF EXISTS "animation_iterations";
    ALTER TABLE "pages_blocks_testimonials" DROP COLUMN IF EXISTS "style_overrides";

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

    ALTER TABLE "pages_blocks_gallery_full" DROP COLUMN IF EXISTS "animation";
    ALTER TABLE "pages_blocks_gallery_full" DROP COLUMN IF EXISTS "animation_duration";
    ALTER TABLE "pages_blocks_gallery_full" DROP COLUMN IF EXISTS "animation_delay";
    ALTER TABLE "pages_blocks_gallery_full" DROP COLUMN IF EXISTS "animation_easing";
    ALTER TABLE "pages_blocks_gallery_full" DROP COLUMN IF EXISTS "animation_iterations";
    ALTER TABLE "pages_blocks_gallery_full" DROP COLUMN IF EXISTS "style_overrides";

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

    -- Versioned block tables
    ALTER TABLE "_pages_v_blocks_hero" DROP COLUMN IF EXISTS "animation";
    ALTER TABLE "_pages_v_blocks_hero" DROP COLUMN IF EXISTS "animation_duration";
    ALTER TABLE "_pages_v_blocks_hero" DROP COLUMN IF EXISTS "animation_delay";
    ALTER TABLE "_pages_v_blocks_hero" DROP COLUMN IF EXISTS "animation_easing";
    ALTER TABLE "_pages_v_blocks_hero" DROP COLUMN IF EXISTS "animation_iterations";
    ALTER TABLE "_pages_v_blocks_hero" DROP COLUMN IF EXISTS "style_overrides";

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

    ALTER TABLE "_pages_v_blocks_testimonials" DROP COLUMN IF EXISTS "animation";
    ALTER TABLE "_pages_v_blocks_testimonials" DROP COLUMN IF EXISTS "animation_duration";
    ALTER TABLE "_pages_v_blocks_testimonials" DROP COLUMN IF EXISTS "animation_delay";
    ALTER TABLE "_pages_v_blocks_testimonials" DROP COLUMN IF EXISTS "animation_easing";
    ALTER TABLE "_pages_v_blocks_testimonials" DROP COLUMN IF EXISTS "animation_iterations";
    ALTER TABLE "_pages_v_blocks_testimonials" DROP COLUMN IF EXISTS "style_overrides";

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

    ALTER TABLE "_pages_v_blocks_gallery_full" DROP COLUMN IF EXISTS "animation";
    ALTER TABLE "_pages_v_blocks_gallery_full" DROP COLUMN IF EXISTS "animation_duration";
    ALTER TABLE "_pages_v_blocks_gallery_full" DROP COLUMN IF EXISTS "animation_delay";
    ALTER TABLE "_pages_v_blocks_gallery_full" DROP COLUMN IF EXISTS "animation_easing";
    ALTER TABLE "_pages_v_blocks_gallery_full" DROP COLUMN IF EXISTS "animation_iterations";
    ALTER TABLE "_pages_v_blocks_gallery_full" DROP COLUMN IF EXISTS "style_overrides";

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
  `)
}
