import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Comprehensive idempotent migration that ensures every pages block table,
 * its versioned counterpart, all columns, indexes, and foreign-keys exist.
 *
 * This fixes runtime "Failed query" errors caused by missing tables/columns
 * when earlier migrations were skipped or only partially applied.
 *
 * Safe to run at any time – every DDL statement is guarded with
 * IF NOT EXISTS / IF EXISTS or a DO-EXCEPTION block.
 */

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // ── 1. ENUM types ──────────────────────────────────────────────────
  await db.execute(sql`
    DO $$ BEGIN CREATE TYPE "public"."enum_pages_blocks_cta_variant" AS ENUM('primary', 'secondary'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum__pages_v_blocks_cta_variant" AS ENUM('primary', 'secondary'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum_pages_blocks_partners_variant" AS ENUM('grid', 'carousel'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum__pages_v_blocks_partners_variant" AS ENUM('grid', 'carousel'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum_pages_page_template" AS ENUM('default', 'template-a', 'template-b', 'template-c', 'template-d'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum__pages_v_version_page_template" AS ENUM('default', 'template-a', 'template-b', 'template-c', 'template-d'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  `)

  // ── 2. Ensure pages & _pages_v have all expected columns ───────────
  await db.execute(sql`
    ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "page_template" varchar DEFAULT 'default';
    ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "global_css_overlay" varchar;
    ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "layout_css_overlay" varchar;
    ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "forest_ambient_config" jsonb;

    ALTER TABLE "_pages_v" ADD COLUMN IF NOT EXISTS "version_page_template" varchar DEFAULT 'default';
    ALTER TABLE "_pages_v" ADD COLUMN IF NOT EXISTS "version_global_css_overlay" varchar;
    ALTER TABLE "_pages_v" ADD COLUMN IF NOT EXISTS "version_layout_css_overlay" varchar;
    ALTER TABLE "_pages_v" ADD COLUMN IF NOT EXISTS "version_forest_ambient_config" jsonb;
  `)

  // ── 3. NON-VERSIONED block tables (CREATE TABLE IF NOT EXISTS) ─────
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "pages_blocks_hero" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "heading" varchar,
      "subheading" varchar,
      "background_image_id" integer,
      "cta_text" varchar,
      "cta_link" varchar,
      "badge" varchar,
      "secondary_cta_text" varchar,
      "secondary_cta_link" varchar,
      "show_scroll_indicator" boolean DEFAULT true,
      "full_height" boolean DEFAULT false,
      "animation" varchar,
      "animation_duration" numeric,
      "animation_delay" numeric,
      "animation_easing" varchar,
      "animation_iterations" varchar,
      "style_overrides" jsonb,
      "block_name" varchar
    );

    CREATE TABLE IF NOT EXISTS "pages_blocks_stats" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "animation" varchar,
      "animation_duration" numeric,
      "animation_delay" numeric,
      "animation_easing" varchar,
      "animation_iterations" varchar,
      "style_overrides" jsonb,
      "block_name" varchar
    );

    CREATE TABLE IF NOT EXISTS "pages_blocks_stats_items" (
      "_order" integer NOT NULL,
      "_parent_id" varchar NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "value" numeric,
      "suffix" varchar,
      "label" varchar
    );

    CREATE TABLE IF NOT EXISTS "pages_blocks_services" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "heading" varchar,
      "animation" varchar,
      "animation_duration" numeric,
      "animation_delay" numeric,
      "animation_easing" varchar,
      "animation_iterations" varchar,
      "style_overrides" jsonb,
      "block_name" varchar
    );

    CREATE TABLE IF NOT EXISTS "pages_blocks_services_items" (
      "_order" integer NOT NULL,
      "_parent_id" varchar NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "emoji" varchar,
      "title" varchar,
      "description" varchar,
      "link" varchar
    );

    CREATE TABLE IF NOT EXISTS "pages_blocks_featured_products" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "heading" varchar,
      "limit" numeric,
      "link_text" varchar,
      "link_url" varchar,
      "animation" varchar,
      "animation_duration" numeric,
      "animation_delay" numeric,
      "animation_easing" varchar,
      "animation_iterations" varchar,
      "style_overrides" jsonb,
      "block_name" varchar
    );

    CREATE TABLE IF NOT EXISTS "pages_blocks_about" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "badge" varchar,
      "heading" varchar,
      "content" jsonb,
      "image_id" integer,
      "cta_text" varchar,
      "cta_link" varchar,
      "animation" varchar,
      "animation_duration" numeric,
      "animation_delay" numeric,
      "animation_easing" varchar,
      "animation_iterations" varchar,
      "style_overrides" jsonb,
      "block_name" varchar
    );

    CREATE TABLE IF NOT EXISTS "pages_blocks_about_highlights" (
      "_order" integer NOT NULL,
      "_parent_id" varchar NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "text" varchar
    );

    CREATE TABLE IF NOT EXISTS "pages_blocks_rich_text" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "content" jsonb,
      "animation" varchar,
      "animation_duration" numeric,
      "animation_delay" numeric,
      "animation_easing" varchar,
      "animation_iterations" varchar,
      "style_overrides" jsonb,
      "block_name" varchar
    );

    CREATE TABLE IF NOT EXISTS "pages_blocks_gallery" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "animation" varchar,
      "animation_duration" numeric,
      "animation_delay" numeric,
      "animation_easing" varchar,
      "animation_iterations" varchar,
      "style_overrides" jsonb,
      "block_name" varchar
    );

    CREATE TABLE IF NOT EXISTS "pages_blocks_gallery_images" (
      "_order" integer NOT NULL,
      "_parent_id" varchar NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "image_id" integer
    );

    CREATE TABLE IF NOT EXISTS "pages_blocks_gallery_full" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "heading" varchar,
      "animation" varchar,
      "animation_duration" numeric,
      "animation_delay" numeric,
      "animation_easing" varchar,
      "animation_iterations" varchar,
      "style_overrides" jsonb,
      "block_name" varchar
    );

    CREATE TABLE IF NOT EXISTS "pages_blocks_gallery_full_items" (
      "_order" integer NOT NULL,
      "_parent_id" varchar NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "image_id" integer,
      "alt" varchar,
      "category" varchar,
      "category_label" varchar
    );

    CREATE TABLE IF NOT EXISTS "pages_blocks_testimonials" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "heading" varchar,
      "animation" varchar,
      "animation_duration" numeric,
      "animation_delay" numeric,
      "animation_easing" varchar,
      "animation_iterations" varchar,
      "style_overrides" jsonb,
      "block_name" varchar
    );

    CREATE TABLE IF NOT EXISTS "pages_blocks_testimonials_items" (
      "_order" integer NOT NULL,
      "_parent_id" varchar NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "quote" varchar,
      "author" varchar,
      "event" varchar,
      "rating" numeric DEFAULT 5
    );

    CREATE TABLE IF NOT EXISTS "pages_blocks_cta" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "heading" varchar,
      "text" varchar,
      "button_text" varchar,
      "button_link" varchar,
      "variant" varchar DEFAULT 'primary',
      "phone_number" varchar,
      "secondary_button_text" varchar,
      "secondary_button_link" varchar,
      "animation" varchar,
      "animation_duration" numeric,
      "animation_delay" numeric,
      "animation_easing" varchar,
      "animation_iterations" varchar,
      "style_overrides" jsonb,
      "block_name" varchar
    );

    CREATE TABLE IF NOT EXISTS "pages_blocks_faq" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "animation" varchar,
      "animation_duration" numeric,
      "animation_delay" numeric,
      "animation_easing" varchar,
      "animation_iterations" varchar,
      "style_overrides" jsonb,
      "block_name" varchar
    );

    CREATE TABLE IF NOT EXISTS "pages_blocks_faq_items" (
      "_order" integer NOT NULL,
      "_parent_id" varchar NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "question" varchar,
      "answer" varchar
    );

    CREATE TABLE IF NOT EXISTS "pages_blocks_pricing" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "heading" varchar,
      "subheading" varchar,
      "animation" varchar,
      "animation_duration" numeric,
      "animation_delay" numeric,
      "animation_easing" varchar,
      "animation_iterations" varchar,
      "style_overrides" jsonb,
      "block_name" varchar
    );

    CREATE TABLE IF NOT EXISTS "pages_blocks_pricing_packages" (
      "_order" integer NOT NULL,
      "_parent_id" varchar NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "name" varchar,
      "price" varchar,
      "cta_text" varchar,
      "cta_link" varchar,
      "featured" boolean DEFAULT false
    );

    CREATE TABLE IF NOT EXISTS "pages_blocks_pricing_packages_features" (
      "_order" integer NOT NULL,
      "_parent_id" varchar NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "text" varchar
    );

    CREATE TABLE IF NOT EXISTS "pages_blocks_steps" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "heading" varchar,
      "animation" varchar,
      "animation_duration" numeric,
      "animation_delay" numeric,
      "animation_easing" varchar,
      "animation_iterations" varchar,
      "style_overrides" jsonb,
      "block_name" varchar
    );

    CREATE TABLE IF NOT EXISTS "pages_blocks_steps_steps" (
      "_order" integer NOT NULL,
      "_parent_id" varchar NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "emoji" varchar,
      "title" varchar,
      "description" varchar
    );

    CREATE TABLE IF NOT EXISTS "pages_blocks_contact_form" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "heading" varchar,
      "subheading" varchar,
      "animation" varchar,
      "animation_duration" numeric,
      "animation_delay" numeric,
      "animation_easing" varchar,
      "animation_iterations" varchar,
      "style_overrides" jsonb,
      "block_name" varchar
    );

    CREATE TABLE IF NOT EXISTS "pages_blocks_legal_text" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "heading" varchar,
      "effective_date" timestamp(3) with time zone,
      "content" jsonb,
      "animation" varchar,
      "animation_duration" numeric,
      "animation_delay" numeric,
      "animation_easing" varchar,
      "animation_iterations" varchar,
      "style_overrides" jsonb,
      "block_name" varchar
    );

    CREATE TABLE IF NOT EXISTS "pages_blocks_partners" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "heading" varchar,
      "variant" varchar DEFAULT 'grid',
      "grayscale" boolean DEFAULT true,
      "animation" varchar,
      "animation_duration" numeric,
      "animation_delay" numeric,
      "animation_easing" varchar,
      "animation_iterations" varchar,
      "style_overrides" jsonb,
      "block_name" varchar
    );

    CREATE TABLE IF NOT EXISTS "pages_blocks_partners_items" (
      "_order" integer NOT NULL,
      "_parent_id" varchar NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "logo_id" integer,
      "name" varchar,
      "url" varchar
    );

    CREATE TABLE IF NOT EXISTS "pages_blocks_team" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "heading" varchar,
      "animation" varchar,
      "animation_duration" numeric,
      "animation_delay" numeric,
      "animation_easing" varchar,
      "animation_iterations" varchar,
      "style_overrides" jsonb,
      "block_name" varchar
    );

    CREATE TABLE IF NOT EXISTS "pages_blocks_team_people" (
      "_order" integer NOT NULL,
      "_parent_id" varchar NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "photo_id" integer,
      "name" varchar,
      "role" varchar,
      "bio" varchar
    );

    CREATE TABLE IF NOT EXISTS "pages_blocks_team_people_socials" (
      "_order" integer NOT NULL,
      "_parent_id" varchar NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "label" varchar,
      "url" varchar
    );

    CREATE TABLE IF NOT EXISTS "pages_blocks_map_area" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "heading" varchar,
      "description" varchar,
      "embed_url" varchar,
      "note" varchar,
      "animation" varchar,
      "animation_duration" numeric,
      "animation_delay" numeric,
      "animation_easing" varchar,
      "animation_iterations" varchar,
      "style_overrides" jsonb,
      "block_name" varchar
    );

    CREATE TABLE IF NOT EXISTS "pages_blocks_map_area_cities" (
      "_order" integer NOT NULL,
      "_parent_id" varchar NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "name" varchar
    );

    CREATE TABLE IF NOT EXISTS "pages_blocks_offer_cards" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "heading" varchar,
      "animation" varchar,
      "animation_duration" numeric,
      "animation_delay" numeric,
      "animation_easing" varchar,
      "animation_iterations" varchar,
      "style_overrides" jsonb,
      "block_name" varchar
    );

    CREATE TABLE IF NOT EXISTS "pages_blocks_offer_cards_cards" (
      "_order" integer NOT NULL,
      "_parent_id" varchar NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "title" varchar,
      "price_from" varchar,
      "badge" varchar,
      "featured" boolean DEFAULT false,
      "cta_text" varchar,
      "cta_link" varchar
    );

    CREATE TABLE IF NOT EXISTS "pages_blocks_offer_cards_cards_features" (
      "_order" integer NOT NULL,
      "_parent_id" varchar NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "text" varchar
    );
  `)

  // ── 4. VERSIONED block tables (CREATE TABLE IF NOT EXISTS) ─────────
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "_pages_v_blocks_hero" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "heading" varchar,
      "subheading" varchar,
      "background_image_id" integer,
      "cta_text" varchar,
      "cta_link" varchar,
      "badge" varchar,
      "secondary_cta_text" varchar,
      "secondary_cta_link" varchar,
      "show_scroll_indicator" boolean DEFAULT true,
      "full_height" boolean DEFAULT false,
      "animation" varchar,
      "animation_duration" numeric,
      "animation_delay" numeric,
      "animation_easing" varchar,
      "animation_iterations" varchar,
      "style_overrides" jsonb,
      "_uuid" varchar,
      "block_name" varchar
    );

    CREATE TABLE IF NOT EXISTS "_pages_v_blocks_stats" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "animation" varchar,
      "animation_duration" numeric,
      "animation_delay" numeric,
      "animation_easing" varchar,
      "animation_iterations" varchar,
      "style_overrides" jsonb,
      "_uuid" varchar,
      "block_name" varchar
    );

    CREATE TABLE IF NOT EXISTS "_pages_v_blocks_stats_items" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "value" numeric,
      "suffix" varchar,
      "label" varchar,
      "_uuid" varchar
    );

    CREATE TABLE IF NOT EXISTS "_pages_v_blocks_services" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "heading" varchar,
      "animation" varchar,
      "animation_duration" numeric,
      "animation_delay" numeric,
      "animation_easing" varchar,
      "animation_iterations" varchar,
      "style_overrides" jsonb,
      "_uuid" varchar,
      "block_name" varchar
    );

    CREATE TABLE IF NOT EXISTS "_pages_v_blocks_services_items" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "emoji" varchar,
      "title" varchar,
      "description" varchar,
      "link" varchar,
      "_uuid" varchar
    );

    CREATE TABLE IF NOT EXISTS "_pages_v_blocks_featured_products" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "heading" varchar,
      "limit" numeric,
      "link_text" varchar,
      "link_url" varchar,
      "animation" varchar,
      "animation_duration" numeric,
      "animation_delay" numeric,
      "animation_easing" varchar,
      "animation_iterations" varchar,
      "style_overrides" jsonb,
      "_uuid" varchar,
      "block_name" varchar
    );

    CREATE TABLE IF NOT EXISTS "_pages_v_blocks_about" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "badge" varchar,
      "heading" varchar,
      "content" jsonb,
      "image_id" integer,
      "cta_text" varchar,
      "cta_link" varchar,
      "animation" varchar,
      "animation_duration" numeric,
      "animation_delay" numeric,
      "animation_easing" varchar,
      "animation_iterations" varchar,
      "style_overrides" jsonb,
      "_uuid" varchar,
      "block_name" varchar
    );

    CREATE TABLE IF NOT EXISTS "_pages_v_blocks_about_highlights" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "text" varchar,
      "_uuid" varchar
    );

    CREATE TABLE IF NOT EXISTS "_pages_v_blocks_rich_text" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "content" jsonb,
      "animation" varchar,
      "animation_duration" numeric,
      "animation_delay" numeric,
      "animation_easing" varchar,
      "animation_iterations" varchar,
      "style_overrides" jsonb,
      "_uuid" varchar,
      "block_name" varchar
    );

    CREATE TABLE IF NOT EXISTS "_pages_v_blocks_gallery" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "animation" varchar,
      "animation_duration" numeric,
      "animation_delay" numeric,
      "animation_easing" varchar,
      "animation_iterations" varchar,
      "style_overrides" jsonb,
      "_uuid" varchar,
      "block_name" varchar
    );

    CREATE TABLE IF NOT EXISTS "_pages_v_blocks_gallery_images" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "image_id" integer,
      "_uuid" varchar
    );

    CREATE TABLE IF NOT EXISTS "_pages_v_blocks_gallery_full" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "heading" varchar,
      "animation" varchar,
      "animation_duration" numeric,
      "animation_delay" numeric,
      "animation_easing" varchar,
      "animation_iterations" varchar,
      "style_overrides" jsonb,
      "_uuid" varchar,
      "block_name" varchar
    );

    CREATE TABLE IF NOT EXISTS "_pages_v_blocks_gallery_full_items" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "image_id" integer,
      "alt" varchar,
      "category" varchar,
      "category_label" varchar,
      "_uuid" varchar
    );

    CREATE TABLE IF NOT EXISTS "_pages_v_blocks_testimonials" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "heading" varchar,
      "animation" varchar,
      "animation_duration" numeric,
      "animation_delay" numeric,
      "animation_easing" varchar,
      "animation_iterations" varchar,
      "style_overrides" jsonb,
      "_uuid" varchar,
      "block_name" varchar
    );

    CREATE TABLE IF NOT EXISTS "_pages_v_blocks_testimonials_items" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "quote" varchar,
      "author" varchar,
      "event" varchar,
      "rating" numeric DEFAULT 5,
      "_uuid" varchar
    );

    CREATE TABLE IF NOT EXISTS "_pages_v_blocks_cta" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "heading" varchar,
      "text" varchar,
      "button_text" varchar,
      "button_link" varchar,
      "variant" varchar DEFAULT 'primary',
      "phone_number" varchar,
      "secondary_button_text" varchar,
      "secondary_button_link" varchar,
      "animation" varchar,
      "animation_duration" numeric,
      "animation_delay" numeric,
      "animation_easing" varchar,
      "animation_iterations" varchar,
      "style_overrides" jsonb,
      "_uuid" varchar,
      "block_name" varchar
    );

    CREATE TABLE IF NOT EXISTS "_pages_v_blocks_faq" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "animation" varchar,
      "animation_duration" numeric,
      "animation_delay" numeric,
      "animation_easing" varchar,
      "animation_iterations" varchar,
      "style_overrides" jsonb,
      "_uuid" varchar,
      "block_name" varchar
    );

    CREATE TABLE IF NOT EXISTS "_pages_v_blocks_faq_items" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "question" varchar,
      "answer" varchar,
      "_uuid" varchar
    );

    CREATE TABLE IF NOT EXISTS "_pages_v_blocks_pricing" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "heading" varchar,
      "subheading" varchar,
      "animation" varchar,
      "animation_duration" numeric,
      "animation_delay" numeric,
      "animation_easing" varchar,
      "animation_iterations" varchar,
      "style_overrides" jsonb,
      "_uuid" varchar,
      "block_name" varchar
    );

    CREATE TABLE IF NOT EXISTS "_pages_v_blocks_pricing_packages" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "name" varchar,
      "price" varchar,
      "cta_text" varchar,
      "cta_link" varchar,
      "featured" boolean DEFAULT false,
      "_uuid" varchar
    );

    CREATE TABLE IF NOT EXISTS "_pages_v_blocks_pricing_packages_features" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "text" varchar,
      "_uuid" varchar
    );

    CREATE TABLE IF NOT EXISTS "_pages_v_blocks_steps" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "heading" varchar,
      "animation" varchar,
      "animation_duration" numeric,
      "animation_delay" numeric,
      "animation_easing" varchar,
      "animation_iterations" varchar,
      "style_overrides" jsonb,
      "_uuid" varchar,
      "block_name" varchar
    );

    CREATE TABLE IF NOT EXISTS "_pages_v_blocks_steps_steps" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "emoji" varchar,
      "title" varchar,
      "description" varchar,
      "_uuid" varchar
    );

    CREATE TABLE IF NOT EXISTS "_pages_v_blocks_contact_form" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "heading" varchar,
      "subheading" varchar,
      "animation" varchar,
      "animation_duration" numeric,
      "animation_delay" numeric,
      "animation_easing" varchar,
      "animation_iterations" varchar,
      "style_overrides" jsonb,
      "_uuid" varchar,
      "block_name" varchar
    );

    CREATE TABLE IF NOT EXISTS "_pages_v_blocks_legal_text" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "heading" varchar,
      "effective_date" timestamp(3) with time zone,
      "content" jsonb,
      "animation" varchar,
      "animation_duration" numeric,
      "animation_delay" numeric,
      "animation_easing" varchar,
      "animation_iterations" varchar,
      "style_overrides" jsonb,
      "_uuid" varchar,
      "block_name" varchar
    );

    CREATE TABLE IF NOT EXISTS "_pages_v_blocks_partners" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "heading" varchar,
      "variant" varchar DEFAULT 'grid',
      "grayscale" boolean DEFAULT true,
      "animation" varchar,
      "animation_duration" numeric,
      "animation_delay" numeric,
      "animation_easing" varchar,
      "animation_iterations" varchar,
      "style_overrides" jsonb,
      "_uuid" varchar,
      "block_name" varchar
    );

    CREATE TABLE IF NOT EXISTS "_pages_v_blocks_partners_items" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "logo_id" integer,
      "name" varchar,
      "url" varchar,
      "_uuid" varchar
    );

    CREATE TABLE IF NOT EXISTS "_pages_v_blocks_team" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "heading" varchar,
      "animation" varchar,
      "animation_duration" numeric,
      "animation_delay" numeric,
      "animation_easing" varchar,
      "animation_iterations" varchar,
      "style_overrides" jsonb,
      "_uuid" varchar,
      "block_name" varchar
    );

    CREATE TABLE IF NOT EXISTS "_pages_v_blocks_team_people" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "photo_id" integer,
      "name" varchar,
      "role" varchar,
      "bio" varchar,
      "_uuid" varchar
    );

    CREATE TABLE IF NOT EXISTS "_pages_v_blocks_team_people_socials" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "label" varchar,
      "url" varchar,
      "_uuid" varchar
    );

    CREATE TABLE IF NOT EXISTS "_pages_v_blocks_map_area" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "heading" varchar,
      "description" varchar,
      "embed_url" varchar,
      "note" varchar,
      "animation" varchar,
      "animation_duration" numeric,
      "animation_delay" numeric,
      "animation_easing" varchar,
      "animation_iterations" varchar,
      "style_overrides" jsonb,
      "_uuid" varchar,
      "block_name" varchar
    );

    CREATE TABLE IF NOT EXISTS "_pages_v_blocks_map_area_cities" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "name" varchar,
      "_uuid" varchar
    );

    CREATE TABLE IF NOT EXISTS "_pages_v_blocks_offer_cards" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "heading" varchar,
      "animation" varchar,
      "animation_duration" numeric,
      "animation_delay" numeric,
      "animation_easing" varchar,
      "animation_iterations" varchar,
      "style_overrides" jsonb,
      "_uuid" varchar,
      "block_name" varchar
    );

    CREATE TABLE IF NOT EXISTS "_pages_v_blocks_offer_cards_cards" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "title" varchar,
      "price_from" varchar,
      "badge" varchar,
      "featured" boolean DEFAULT false,
      "cta_text" varchar,
      "cta_link" varchar,
      "_uuid" varchar
    );

    CREATE TABLE IF NOT EXISTS "_pages_v_blocks_offer_cards_cards_features" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "text" varchar,
      "_uuid" varchar
    );
  `)

  // ── 5. ADD COLUMN IF NOT EXISTS – covers tables created by earlier
  //       migrations that may lack columns added later ────────────────
  await db.execute(sql`
    -- Hero
    ALTER TABLE "pages_blocks_hero" ADD COLUMN IF NOT EXISTS "heading" varchar;
    ALTER TABLE "pages_blocks_hero" ADD COLUMN IF NOT EXISTS "subheading" varchar;
    ALTER TABLE "pages_blocks_hero" ADD COLUMN IF NOT EXISTS "background_image_id" integer;
    ALTER TABLE "pages_blocks_hero" ADD COLUMN IF NOT EXISTS "cta_text" varchar;
    ALTER TABLE "pages_blocks_hero" ADD COLUMN IF NOT EXISTS "cta_link" varchar;
    ALTER TABLE "pages_blocks_hero" ADD COLUMN IF NOT EXISTS "badge" varchar;
    ALTER TABLE "pages_blocks_hero" ADD COLUMN IF NOT EXISTS "secondary_cta_text" varchar;
    ALTER TABLE "pages_blocks_hero" ADD COLUMN IF NOT EXISTS "secondary_cta_link" varchar;
    ALTER TABLE "pages_blocks_hero" ADD COLUMN IF NOT EXISTS "show_scroll_indicator" boolean DEFAULT true;
    ALTER TABLE "pages_blocks_hero" ADD COLUMN IF NOT EXISTS "full_height" boolean DEFAULT false;
    ALTER TABLE "pages_blocks_hero" ADD COLUMN IF NOT EXISTS "animation" varchar;
    ALTER TABLE "pages_blocks_hero" ADD COLUMN IF NOT EXISTS "animation_duration" numeric;
    ALTER TABLE "pages_blocks_hero" ADD COLUMN IF NOT EXISTS "animation_delay" numeric;
    ALTER TABLE "pages_blocks_hero" ADD COLUMN IF NOT EXISTS "animation_easing" varchar;
    ALTER TABLE "pages_blocks_hero" ADD COLUMN IF NOT EXISTS "animation_iterations" varchar;
    ALTER TABLE "pages_blocks_hero" ADD COLUMN IF NOT EXISTS "style_overrides" jsonb;
    ALTER TABLE "pages_blocks_hero" ADD COLUMN IF NOT EXISTS "block_name" varchar;

    -- Stats
    ALTER TABLE "pages_blocks_stats" ADD COLUMN IF NOT EXISTS "animation" varchar;
    ALTER TABLE "pages_blocks_stats" ADD COLUMN IF NOT EXISTS "animation_duration" numeric;
    ALTER TABLE "pages_blocks_stats" ADD COLUMN IF NOT EXISTS "animation_delay" numeric;
    ALTER TABLE "pages_blocks_stats" ADD COLUMN IF NOT EXISTS "animation_easing" varchar;
    ALTER TABLE "pages_blocks_stats" ADD COLUMN IF NOT EXISTS "animation_iterations" varchar;
    ALTER TABLE "pages_blocks_stats" ADD COLUMN IF NOT EXISTS "style_overrides" jsonb;
    ALTER TABLE "pages_blocks_stats" ADD COLUMN IF NOT EXISTS "block_name" varchar;
    ALTER TABLE "pages_blocks_stats_items" ADD COLUMN IF NOT EXISTS "value" numeric;
    ALTER TABLE "pages_blocks_stats_items" ADD COLUMN IF NOT EXISTS "suffix" varchar;
    ALTER TABLE "pages_blocks_stats_items" ADD COLUMN IF NOT EXISTS "label" varchar;

    -- Services
    ALTER TABLE "pages_blocks_services" ADD COLUMN IF NOT EXISTS "heading" varchar;
    ALTER TABLE "pages_blocks_services" ADD COLUMN IF NOT EXISTS "animation" varchar;
    ALTER TABLE "pages_blocks_services" ADD COLUMN IF NOT EXISTS "animation_duration" numeric;
    ALTER TABLE "pages_blocks_services" ADD COLUMN IF NOT EXISTS "animation_delay" numeric;
    ALTER TABLE "pages_blocks_services" ADD COLUMN IF NOT EXISTS "animation_easing" varchar;
    ALTER TABLE "pages_blocks_services" ADD COLUMN IF NOT EXISTS "animation_iterations" varchar;
    ALTER TABLE "pages_blocks_services" ADD COLUMN IF NOT EXISTS "style_overrides" jsonb;
    ALTER TABLE "pages_blocks_services" ADD COLUMN IF NOT EXISTS "block_name" varchar;
    ALTER TABLE "pages_blocks_services_items" ADD COLUMN IF NOT EXISTS "emoji" varchar;
    ALTER TABLE "pages_blocks_services_items" ADD COLUMN IF NOT EXISTS "title" varchar;
    ALTER TABLE "pages_blocks_services_items" ADD COLUMN IF NOT EXISTS "description" varchar;
    ALTER TABLE "pages_blocks_services_items" ADD COLUMN IF NOT EXISTS "link" varchar;

    -- Featured Products
    ALTER TABLE "pages_blocks_featured_products" ADD COLUMN IF NOT EXISTS "heading" varchar;
    ALTER TABLE "pages_blocks_featured_products" ADD COLUMN IF NOT EXISTS "limit" numeric;
    ALTER TABLE "pages_blocks_featured_products" ADD COLUMN IF NOT EXISTS "link_text" varchar;
    ALTER TABLE "pages_blocks_featured_products" ADD COLUMN IF NOT EXISTS "link_url" varchar;
    ALTER TABLE "pages_blocks_featured_products" ADD COLUMN IF NOT EXISTS "animation" varchar;
    ALTER TABLE "pages_blocks_featured_products" ADD COLUMN IF NOT EXISTS "animation_duration" numeric;
    ALTER TABLE "pages_blocks_featured_products" ADD COLUMN IF NOT EXISTS "animation_delay" numeric;
    ALTER TABLE "pages_blocks_featured_products" ADD COLUMN IF NOT EXISTS "animation_easing" varchar;
    ALTER TABLE "pages_blocks_featured_products" ADD COLUMN IF NOT EXISTS "animation_iterations" varchar;
    ALTER TABLE "pages_blocks_featured_products" ADD COLUMN IF NOT EXISTS "style_overrides" jsonb;
    ALTER TABLE "pages_blocks_featured_products" ADD COLUMN IF NOT EXISTS "block_name" varchar;

    -- About
    ALTER TABLE "pages_blocks_about" ADD COLUMN IF NOT EXISTS "badge" varchar;
    ALTER TABLE "pages_blocks_about" ADD COLUMN IF NOT EXISTS "heading" varchar;
    ALTER TABLE "pages_blocks_about" ADD COLUMN IF NOT EXISTS "content" jsonb;
    ALTER TABLE "pages_blocks_about" ADD COLUMN IF NOT EXISTS "image_id" integer;
    ALTER TABLE "pages_blocks_about" ADD COLUMN IF NOT EXISTS "cta_text" varchar;
    ALTER TABLE "pages_blocks_about" ADD COLUMN IF NOT EXISTS "cta_link" varchar;
    ALTER TABLE "pages_blocks_about" ADD COLUMN IF NOT EXISTS "animation" varchar;
    ALTER TABLE "pages_blocks_about" ADD COLUMN IF NOT EXISTS "animation_duration" numeric;
    ALTER TABLE "pages_blocks_about" ADD COLUMN IF NOT EXISTS "animation_delay" numeric;
    ALTER TABLE "pages_blocks_about" ADD COLUMN IF NOT EXISTS "animation_easing" varchar;
    ALTER TABLE "pages_blocks_about" ADD COLUMN IF NOT EXISTS "animation_iterations" varchar;
    ALTER TABLE "pages_blocks_about" ADD COLUMN IF NOT EXISTS "style_overrides" jsonb;
    ALTER TABLE "pages_blocks_about" ADD COLUMN IF NOT EXISTS "block_name" varchar;
    ALTER TABLE "pages_blocks_about_highlights" ADD COLUMN IF NOT EXISTS "text" varchar;

    -- Rich Text
    ALTER TABLE "pages_blocks_rich_text" ADD COLUMN IF NOT EXISTS "content" jsonb;
    ALTER TABLE "pages_blocks_rich_text" ADD COLUMN IF NOT EXISTS "animation" varchar;
    ALTER TABLE "pages_blocks_rich_text" ADD COLUMN IF NOT EXISTS "animation_duration" numeric;
    ALTER TABLE "pages_blocks_rich_text" ADD COLUMN IF NOT EXISTS "animation_delay" numeric;
    ALTER TABLE "pages_blocks_rich_text" ADD COLUMN IF NOT EXISTS "animation_easing" varchar;
    ALTER TABLE "pages_blocks_rich_text" ADD COLUMN IF NOT EXISTS "animation_iterations" varchar;
    ALTER TABLE "pages_blocks_rich_text" ADD COLUMN IF NOT EXISTS "style_overrides" jsonb;
    ALTER TABLE "pages_blocks_rich_text" ADD COLUMN IF NOT EXISTS "block_name" varchar;

    -- Gallery
    ALTER TABLE "pages_blocks_gallery" ADD COLUMN IF NOT EXISTS "animation" varchar;
    ALTER TABLE "pages_blocks_gallery" ADD COLUMN IF NOT EXISTS "animation_duration" numeric;
    ALTER TABLE "pages_blocks_gallery" ADD COLUMN IF NOT EXISTS "animation_delay" numeric;
    ALTER TABLE "pages_blocks_gallery" ADD COLUMN IF NOT EXISTS "animation_easing" varchar;
    ALTER TABLE "pages_blocks_gallery" ADD COLUMN IF NOT EXISTS "animation_iterations" varchar;
    ALTER TABLE "pages_blocks_gallery" ADD COLUMN IF NOT EXISTS "style_overrides" jsonb;
    ALTER TABLE "pages_blocks_gallery" ADD COLUMN IF NOT EXISTS "block_name" varchar;
    ALTER TABLE "pages_blocks_gallery_images" ADD COLUMN IF NOT EXISTS "image_id" integer;

    -- Gallery Full
    ALTER TABLE "pages_blocks_gallery_full" ADD COLUMN IF NOT EXISTS "heading" varchar;
    ALTER TABLE "pages_blocks_gallery_full" ADD COLUMN IF NOT EXISTS "animation" varchar;
    ALTER TABLE "pages_blocks_gallery_full" ADD COLUMN IF NOT EXISTS "animation_duration" numeric;
    ALTER TABLE "pages_blocks_gallery_full" ADD COLUMN IF NOT EXISTS "animation_delay" numeric;
    ALTER TABLE "pages_blocks_gallery_full" ADD COLUMN IF NOT EXISTS "animation_easing" varchar;
    ALTER TABLE "pages_blocks_gallery_full" ADD COLUMN IF NOT EXISTS "animation_iterations" varchar;
    ALTER TABLE "pages_blocks_gallery_full" ADD COLUMN IF NOT EXISTS "style_overrides" jsonb;
    ALTER TABLE "pages_blocks_gallery_full" ADD COLUMN IF NOT EXISTS "block_name" varchar;
    ALTER TABLE "pages_blocks_gallery_full_items" ADD COLUMN IF NOT EXISTS "image_id" integer;
    ALTER TABLE "pages_blocks_gallery_full_items" ADD COLUMN IF NOT EXISTS "alt" varchar;
    ALTER TABLE "pages_blocks_gallery_full_items" ADD COLUMN IF NOT EXISTS "category" varchar;
    ALTER TABLE "pages_blocks_gallery_full_items" ADD COLUMN IF NOT EXISTS "category_label" varchar;

    -- Testimonials
    ALTER TABLE "pages_blocks_testimonials" ADD COLUMN IF NOT EXISTS "heading" varchar;
    ALTER TABLE "pages_blocks_testimonials" ADD COLUMN IF NOT EXISTS "animation" varchar;
    ALTER TABLE "pages_blocks_testimonials" ADD COLUMN IF NOT EXISTS "animation_duration" numeric;
    ALTER TABLE "pages_blocks_testimonials" ADD COLUMN IF NOT EXISTS "animation_delay" numeric;
    ALTER TABLE "pages_blocks_testimonials" ADD COLUMN IF NOT EXISTS "animation_easing" varchar;
    ALTER TABLE "pages_blocks_testimonials" ADD COLUMN IF NOT EXISTS "animation_iterations" varchar;
    ALTER TABLE "pages_blocks_testimonials" ADD COLUMN IF NOT EXISTS "style_overrides" jsonb;
    ALTER TABLE "pages_blocks_testimonials" ADD COLUMN IF NOT EXISTS "block_name" varchar;
    ALTER TABLE "pages_blocks_testimonials_items" ADD COLUMN IF NOT EXISTS "quote" varchar;
    ALTER TABLE "pages_blocks_testimonials_items" ADD COLUMN IF NOT EXISTS "author" varchar;
    ALTER TABLE "pages_blocks_testimonials_items" ADD COLUMN IF NOT EXISTS "event" varchar;
    ALTER TABLE "pages_blocks_testimonials_items" ADD COLUMN IF NOT EXISTS "rating" numeric DEFAULT 5;

    -- CTA
    ALTER TABLE "pages_blocks_cta" ADD COLUMN IF NOT EXISTS "heading" varchar;
    ALTER TABLE "pages_blocks_cta" ADD COLUMN IF NOT EXISTS "text" varchar;
    ALTER TABLE "pages_blocks_cta" ADD COLUMN IF NOT EXISTS "button_text" varchar;
    ALTER TABLE "pages_blocks_cta" ADD COLUMN IF NOT EXISTS "button_link" varchar;
    ALTER TABLE "pages_blocks_cta" ADD COLUMN IF NOT EXISTS "variant" varchar DEFAULT 'primary';
    ALTER TABLE "pages_blocks_cta" ADD COLUMN IF NOT EXISTS "phone_number" varchar;
    ALTER TABLE "pages_blocks_cta" ADD COLUMN IF NOT EXISTS "secondary_button_text" varchar;
    ALTER TABLE "pages_blocks_cta" ADD COLUMN IF NOT EXISTS "secondary_button_link" varchar;
    ALTER TABLE "pages_blocks_cta" ADD COLUMN IF NOT EXISTS "animation" varchar;
    ALTER TABLE "pages_blocks_cta" ADD COLUMN IF NOT EXISTS "animation_duration" numeric;
    ALTER TABLE "pages_blocks_cta" ADD COLUMN IF NOT EXISTS "animation_delay" numeric;
    ALTER TABLE "pages_blocks_cta" ADD COLUMN IF NOT EXISTS "animation_easing" varchar;
    ALTER TABLE "pages_blocks_cta" ADD COLUMN IF NOT EXISTS "animation_iterations" varchar;
    ALTER TABLE "pages_blocks_cta" ADD COLUMN IF NOT EXISTS "style_overrides" jsonb;
    ALTER TABLE "pages_blocks_cta" ADD COLUMN IF NOT EXISTS "block_name" varchar;

    -- FAQ
    ALTER TABLE "pages_blocks_faq" ADD COLUMN IF NOT EXISTS "animation" varchar;
    ALTER TABLE "pages_blocks_faq" ADD COLUMN IF NOT EXISTS "animation_duration" numeric;
    ALTER TABLE "pages_blocks_faq" ADD COLUMN IF NOT EXISTS "animation_delay" numeric;
    ALTER TABLE "pages_blocks_faq" ADD COLUMN IF NOT EXISTS "animation_easing" varchar;
    ALTER TABLE "pages_blocks_faq" ADD COLUMN IF NOT EXISTS "animation_iterations" varchar;
    ALTER TABLE "pages_blocks_faq" ADD COLUMN IF NOT EXISTS "style_overrides" jsonb;
    ALTER TABLE "pages_blocks_faq" ADD COLUMN IF NOT EXISTS "block_name" varchar;
    ALTER TABLE "pages_blocks_faq_items" ADD COLUMN IF NOT EXISTS "question" varchar;
    ALTER TABLE "pages_blocks_faq_items" ADD COLUMN IF NOT EXISTS "answer" varchar;

    -- Pricing
    ALTER TABLE "pages_blocks_pricing" ADD COLUMN IF NOT EXISTS "heading" varchar;
    ALTER TABLE "pages_blocks_pricing" ADD COLUMN IF NOT EXISTS "subheading" varchar;
    ALTER TABLE "pages_blocks_pricing" ADD COLUMN IF NOT EXISTS "animation" varchar;
    ALTER TABLE "pages_blocks_pricing" ADD COLUMN IF NOT EXISTS "animation_duration" numeric;
    ALTER TABLE "pages_blocks_pricing" ADD COLUMN IF NOT EXISTS "animation_delay" numeric;
    ALTER TABLE "pages_blocks_pricing" ADD COLUMN IF NOT EXISTS "animation_easing" varchar;
    ALTER TABLE "pages_blocks_pricing" ADD COLUMN IF NOT EXISTS "animation_iterations" varchar;
    ALTER TABLE "pages_blocks_pricing" ADD COLUMN IF NOT EXISTS "style_overrides" jsonb;
    ALTER TABLE "pages_blocks_pricing" ADD COLUMN IF NOT EXISTS "block_name" varchar;
    ALTER TABLE "pages_blocks_pricing_packages" ADD COLUMN IF NOT EXISTS "name" varchar;
    ALTER TABLE "pages_blocks_pricing_packages" ADD COLUMN IF NOT EXISTS "price" varchar;
    ALTER TABLE "pages_blocks_pricing_packages" ADD COLUMN IF NOT EXISTS "cta_text" varchar;
    ALTER TABLE "pages_blocks_pricing_packages" ADD COLUMN IF NOT EXISTS "cta_link" varchar;
    ALTER TABLE "pages_blocks_pricing_packages" ADD COLUMN IF NOT EXISTS "featured" boolean DEFAULT false;
    ALTER TABLE "pages_blocks_pricing_packages_features" ADD COLUMN IF NOT EXISTS "text" varchar;

    -- Steps
    ALTER TABLE "pages_blocks_steps" ADD COLUMN IF NOT EXISTS "heading" varchar;
    ALTER TABLE "pages_blocks_steps" ADD COLUMN IF NOT EXISTS "animation" varchar;
    ALTER TABLE "pages_blocks_steps" ADD COLUMN IF NOT EXISTS "animation_duration" numeric;
    ALTER TABLE "pages_blocks_steps" ADD COLUMN IF NOT EXISTS "animation_delay" numeric;
    ALTER TABLE "pages_blocks_steps" ADD COLUMN IF NOT EXISTS "animation_easing" varchar;
    ALTER TABLE "pages_blocks_steps" ADD COLUMN IF NOT EXISTS "animation_iterations" varchar;
    ALTER TABLE "pages_blocks_steps" ADD COLUMN IF NOT EXISTS "style_overrides" jsonb;
    ALTER TABLE "pages_blocks_steps" ADD COLUMN IF NOT EXISTS "block_name" varchar;
    ALTER TABLE "pages_blocks_steps_steps" ADD COLUMN IF NOT EXISTS "emoji" varchar;
    ALTER TABLE "pages_blocks_steps_steps" ADD COLUMN IF NOT EXISTS "title" varchar;
    ALTER TABLE "pages_blocks_steps_steps" ADD COLUMN IF NOT EXISTS "description" varchar;

    -- Contact Form
    ALTER TABLE "pages_blocks_contact_form" ADD COLUMN IF NOT EXISTS "heading" varchar;
    ALTER TABLE "pages_blocks_contact_form" ADD COLUMN IF NOT EXISTS "subheading" varchar;
    ALTER TABLE "pages_blocks_contact_form" ADD COLUMN IF NOT EXISTS "animation" varchar;
    ALTER TABLE "pages_blocks_contact_form" ADD COLUMN IF NOT EXISTS "animation_duration" numeric;
    ALTER TABLE "pages_blocks_contact_form" ADD COLUMN IF NOT EXISTS "animation_delay" numeric;
    ALTER TABLE "pages_blocks_contact_form" ADD COLUMN IF NOT EXISTS "animation_easing" varchar;
    ALTER TABLE "pages_blocks_contact_form" ADD COLUMN IF NOT EXISTS "animation_iterations" varchar;
    ALTER TABLE "pages_blocks_contact_form" ADD COLUMN IF NOT EXISTS "style_overrides" jsonb;
    ALTER TABLE "pages_blocks_contact_form" ADD COLUMN IF NOT EXISTS "block_name" varchar;

    -- Legal Text
    ALTER TABLE "pages_blocks_legal_text" ADD COLUMN IF NOT EXISTS "heading" varchar;
    ALTER TABLE "pages_blocks_legal_text" ADD COLUMN IF NOT EXISTS "effective_date" timestamp(3) with time zone;
    ALTER TABLE "pages_blocks_legal_text" ADD COLUMN IF NOT EXISTS "content" jsonb;
    ALTER TABLE "pages_blocks_legal_text" ADD COLUMN IF NOT EXISTS "animation" varchar;
    ALTER TABLE "pages_blocks_legal_text" ADD COLUMN IF NOT EXISTS "animation_duration" numeric;
    ALTER TABLE "pages_blocks_legal_text" ADD COLUMN IF NOT EXISTS "animation_delay" numeric;
    ALTER TABLE "pages_blocks_legal_text" ADD COLUMN IF NOT EXISTS "animation_easing" varchar;
    ALTER TABLE "pages_blocks_legal_text" ADD COLUMN IF NOT EXISTS "animation_iterations" varchar;
    ALTER TABLE "pages_blocks_legal_text" ADD COLUMN IF NOT EXISTS "style_overrides" jsonb;
    ALTER TABLE "pages_blocks_legal_text" ADD COLUMN IF NOT EXISTS "block_name" varchar;

    -- Partners
    ALTER TABLE "pages_blocks_partners" ADD COLUMN IF NOT EXISTS "heading" varchar;
    ALTER TABLE "pages_blocks_partners" ADD COLUMN IF NOT EXISTS "variant" varchar DEFAULT 'grid';
    ALTER TABLE "pages_blocks_partners" ADD COLUMN IF NOT EXISTS "grayscale" boolean DEFAULT true;
    ALTER TABLE "pages_blocks_partners" ADD COLUMN IF NOT EXISTS "animation" varchar;
    ALTER TABLE "pages_blocks_partners" ADD COLUMN IF NOT EXISTS "animation_duration" numeric;
    ALTER TABLE "pages_blocks_partners" ADD COLUMN IF NOT EXISTS "animation_delay" numeric;
    ALTER TABLE "pages_blocks_partners" ADD COLUMN IF NOT EXISTS "animation_easing" varchar;
    ALTER TABLE "pages_blocks_partners" ADD COLUMN IF NOT EXISTS "animation_iterations" varchar;
    ALTER TABLE "pages_blocks_partners" ADD COLUMN IF NOT EXISTS "style_overrides" jsonb;
    ALTER TABLE "pages_blocks_partners" ADD COLUMN IF NOT EXISTS "block_name" varchar;
    ALTER TABLE "pages_blocks_partners_items" ADD COLUMN IF NOT EXISTS "logo_id" integer;
    ALTER TABLE "pages_blocks_partners_items" ADD COLUMN IF NOT EXISTS "name" varchar;
    ALTER TABLE "pages_blocks_partners_items" ADD COLUMN IF NOT EXISTS "url" varchar;

    -- Team
    ALTER TABLE "pages_blocks_team" ADD COLUMN IF NOT EXISTS "heading" varchar;
    ALTER TABLE "pages_blocks_team" ADD COLUMN IF NOT EXISTS "animation" varchar;
    ALTER TABLE "pages_blocks_team" ADD COLUMN IF NOT EXISTS "animation_duration" numeric;
    ALTER TABLE "pages_blocks_team" ADD COLUMN IF NOT EXISTS "animation_delay" numeric;
    ALTER TABLE "pages_blocks_team" ADD COLUMN IF NOT EXISTS "animation_easing" varchar;
    ALTER TABLE "pages_blocks_team" ADD COLUMN IF NOT EXISTS "animation_iterations" varchar;
    ALTER TABLE "pages_blocks_team" ADD COLUMN IF NOT EXISTS "style_overrides" jsonb;
    ALTER TABLE "pages_blocks_team" ADD COLUMN IF NOT EXISTS "block_name" varchar;
    ALTER TABLE "pages_blocks_team_people" ADD COLUMN IF NOT EXISTS "photo_id" integer;
    ALTER TABLE "pages_blocks_team_people" ADD COLUMN IF NOT EXISTS "name" varchar;
    ALTER TABLE "pages_blocks_team_people" ADD COLUMN IF NOT EXISTS "role" varchar;
    ALTER TABLE "pages_blocks_team_people" ADD COLUMN IF NOT EXISTS "bio" varchar;
    ALTER TABLE "pages_blocks_team_people_socials" ADD COLUMN IF NOT EXISTS "label" varchar;
    ALTER TABLE "pages_blocks_team_people_socials" ADD COLUMN IF NOT EXISTS "url" varchar;

    -- Map Area
    ALTER TABLE "pages_blocks_map_area" ADD COLUMN IF NOT EXISTS "heading" varchar;
    ALTER TABLE "pages_blocks_map_area" ADD COLUMN IF NOT EXISTS "description" varchar;
    ALTER TABLE "pages_blocks_map_area" ADD COLUMN IF NOT EXISTS "embed_url" varchar;
    ALTER TABLE "pages_blocks_map_area" ADD COLUMN IF NOT EXISTS "note" varchar;
    ALTER TABLE "pages_blocks_map_area" ADD COLUMN IF NOT EXISTS "animation" varchar;
    ALTER TABLE "pages_blocks_map_area" ADD COLUMN IF NOT EXISTS "animation_duration" numeric;
    ALTER TABLE "pages_blocks_map_area" ADD COLUMN IF NOT EXISTS "animation_delay" numeric;
    ALTER TABLE "pages_blocks_map_area" ADD COLUMN IF NOT EXISTS "animation_easing" varchar;
    ALTER TABLE "pages_blocks_map_area" ADD COLUMN IF NOT EXISTS "animation_iterations" varchar;
    ALTER TABLE "pages_blocks_map_area" ADD COLUMN IF NOT EXISTS "style_overrides" jsonb;
    ALTER TABLE "pages_blocks_map_area" ADD COLUMN IF NOT EXISTS "block_name" varchar;
    ALTER TABLE "pages_blocks_map_area_cities" ADD COLUMN IF NOT EXISTS "name" varchar;

    -- Offer Cards
    ALTER TABLE "pages_blocks_offer_cards" ADD COLUMN IF NOT EXISTS "heading" varchar;
    ALTER TABLE "pages_blocks_offer_cards" ADD COLUMN IF NOT EXISTS "animation" varchar;
    ALTER TABLE "pages_blocks_offer_cards" ADD COLUMN IF NOT EXISTS "animation_duration" numeric;
    ALTER TABLE "pages_blocks_offer_cards" ADD COLUMN IF NOT EXISTS "animation_delay" numeric;
    ALTER TABLE "pages_blocks_offer_cards" ADD COLUMN IF NOT EXISTS "animation_easing" varchar;
    ALTER TABLE "pages_blocks_offer_cards" ADD COLUMN IF NOT EXISTS "animation_iterations" varchar;
    ALTER TABLE "pages_blocks_offer_cards" ADD COLUMN IF NOT EXISTS "style_overrides" jsonb;
    ALTER TABLE "pages_blocks_offer_cards" ADD COLUMN IF NOT EXISTS "block_name" varchar;
    ALTER TABLE "pages_blocks_offer_cards_cards" ADD COLUMN IF NOT EXISTS "title" varchar;
    ALTER TABLE "pages_blocks_offer_cards_cards" ADD COLUMN IF NOT EXISTS "price_from" varchar;
    ALTER TABLE "pages_blocks_offer_cards_cards" ADD COLUMN IF NOT EXISTS "badge" varchar;
    ALTER TABLE "pages_blocks_offer_cards_cards" ADD COLUMN IF NOT EXISTS "featured" boolean DEFAULT false;
    ALTER TABLE "pages_blocks_offer_cards_cards" ADD COLUMN IF NOT EXISTS "cta_text" varchar;
    ALTER TABLE "pages_blocks_offer_cards_cards" ADD COLUMN IF NOT EXISTS "cta_link" varchar;
    ALTER TABLE "pages_blocks_offer_cards_cards_features" ADD COLUMN IF NOT EXISTS "text" varchar;
  `)

  // ── 6. ADD COLUMN IF NOT EXISTS for versioned tables ───────────────
  await db.execute(sql`
    ALTER TABLE "_pages_v_blocks_hero" ADD COLUMN IF NOT EXISTS "heading" varchar;
    ALTER TABLE "_pages_v_blocks_hero" ADD COLUMN IF NOT EXISTS "subheading" varchar;
    ALTER TABLE "_pages_v_blocks_hero" ADD COLUMN IF NOT EXISTS "background_image_id" integer;
    ALTER TABLE "_pages_v_blocks_hero" ADD COLUMN IF NOT EXISTS "cta_text" varchar;
    ALTER TABLE "_pages_v_blocks_hero" ADD COLUMN IF NOT EXISTS "cta_link" varchar;
    ALTER TABLE "_pages_v_blocks_hero" ADD COLUMN IF NOT EXISTS "badge" varchar;
    ALTER TABLE "_pages_v_blocks_hero" ADD COLUMN IF NOT EXISTS "secondary_cta_text" varchar;
    ALTER TABLE "_pages_v_blocks_hero" ADD COLUMN IF NOT EXISTS "secondary_cta_link" varchar;
    ALTER TABLE "_pages_v_blocks_hero" ADD COLUMN IF NOT EXISTS "show_scroll_indicator" boolean DEFAULT true;
    ALTER TABLE "_pages_v_blocks_hero" ADD COLUMN IF NOT EXISTS "full_height" boolean DEFAULT false;
    ALTER TABLE "_pages_v_blocks_hero" ADD COLUMN IF NOT EXISTS "animation" varchar;
    ALTER TABLE "_pages_v_blocks_hero" ADD COLUMN IF NOT EXISTS "animation_duration" numeric;
    ALTER TABLE "_pages_v_blocks_hero" ADD COLUMN IF NOT EXISTS "animation_delay" numeric;
    ALTER TABLE "_pages_v_blocks_hero" ADD COLUMN IF NOT EXISTS "animation_easing" varchar;
    ALTER TABLE "_pages_v_blocks_hero" ADD COLUMN IF NOT EXISTS "animation_iterations" varchar;
    ALTER TABLE "_pages_v_blocks_hero" ADD COLUMN IF NOT EXISTS "style_overrides" jsonb;
    ALTER TABLE "_pages_v_blocks_hero" ADD COLUMN IF NOT EXISTS "_uuid" varchar;
    ALTER TABLE "_pages_v_blocks_hero" ADD COLUMN IF NOT EXISTS "block_name" varchar;

    ALTER TABLE "_pages_v_blocks_stats" ADD COLUMN IF NOT EXISTS "animation" varchar;
    ALTER TABLE "_pages_v_blocks_stats" ADD COLUMN IF NOT EXISTS "animation_duration" numeric;
    ALTER TABLE "_pages_v_blocks_stats" ADD COLUMN IF NOT EXISTS "animation_delay" numeric;
    ALTER TABLE "_pages_v_blocks_stats" ADD COLUMN IF NOT EXISTS "animation_easing" varchar;
    ALTER TABLE "_pages_v_blocks_stats" ADD COLUMN IF NOT EXISTS "animation_iterations" varchar;
    ALTER TABLE "_pages_v_blocks_stats" ADD COLUMN IF NOT EXISTS "style_overrides" jsonb;
    ALTER TABLE "_pages_v_blocks_stats" ADD COLUMN IF NOT EXISTS "_uuid" varchar;
    ALTER TABLE "_pages_v_blocks_stats" ADD COLUMN IF NOT EXISTS "block_name" varchar;
    ALTER TABLE "_pages_v_blocks_stats_items" ADD COLUMN IF NOT EXISTS "value" numeric;
    ALTER TABLE "_pages_v_blocks_stats_items" ADD COLUMN IF NOT EXISTS "suffix" varchar;
    ALTER TABLE "_pages_v_blocks_stats_items" ADD COLUMN IF NOT EXISTS "label" varchar;
    ALTER TABLE "_pages_v_blocks_stats_items" ADD COLUMN IF NOT EXISTS "_uuid" varchar;

    ALTER TABLE "_pages_v_blocks_services" ADD COLUMN IF NOT EXISTS "heading" varchar;
    ALTER TABLE "_pages_v_blocks_services" ADD COLUMN IF NOT EXISTS "animation" varchar;
    ALTER TABLE "_pages_v_blocks_services" ADD COLUMN IF NOT EXISTS "animation_duration" numeric;
    ALTER TABLE "_pages_v_blocks_services" ADD COLUMN IF NOT EXISTS "animation_delay" numeric;
    ALTER TABLE "_pages_v_blocks_services" ADD COLUMN IF NOT EXISTS "animation_easing" varchar;
    ALTER TABLE "_pages_v_blocks_services" ADD COLUMN IF NOT EXISTS "animation_iterations" varchar;
    ALTER TABLE "_pages_v_blocks_services" ADD COLUMN IF NOT EXISTS "style_overrides" jsonb;
    ALTER TABLE "_pages_v_blocks_services" ADD COLUMN IF NOT EXISTS "_uuid" varchar;
    ALTER TABLE "_pages_v_blocks_services" ADD COLUMN IF NOT EXISTS "block_name" varchar;
    ALTER TABLE "_pages_v_blocks_services_items" ADD COLUMN IF NOT EXISTS "emoji" varchar;
    ALTER TABLE "_pages_v_blocks_services_items" ADD COLUMN IF NOT EXISTS "title" varchar;
    ALTER TABLE "_pages_v_blocks_services_items" ADD COLUMN IF NOT EXISTS "description" varchar;
    ALTER TABLE "_pages_v_blocks_services_items" ADD COLUMN IF NOT EXISTS "link" varchar;
    ALTER TABLE "_pages_v_blocks_services_items" ADD COLUMN IF NOT EXISTS "_uuid" varchar;

    ALTER TABLE "_pages_v_blocks_featured_products" ADD COLUMN IF NOT EXISTS "heading" varchar;
    ALTER TABLE "_pages_v_blocks_featured_products" ADD COLUMN IF NOT EXISTS "limit" numeric;
    ALTER TABLE "_pages_v_blocks_featured_products" ADD COLUMN IF NOT EXISTS "link_text" varchar;
    ALTER TABLE "_pages_v_blocks_featured_products" ADD COLUMN IF NOT EXISTS "link_url" varchar;
    ALTER TABLE "_pages_v_blocks_featured_products" ADD COLUMN IF NOT EXISTS "animation" varchar;
    ALTER TABLE "_pages_v_blocks_featured_products" ADD COLUMN IF NOT EXISTS "animation_duration" numeric;
    ALTER TABLE "_pages_v_blocks_featured_products" ADD COLUMN IF NOT EXISTS "animation_delay" numeric;
    ALTER TABLE "_pages_v_blocks_featured_products" ADD COLUMN IF NOT EXISTS "animation_easing" varchar;
    ALTER TABLE "_pages_v_blocks_featured_products" ADD COLUMN IF NOT EXISTS "animation_iterations" varchar;
    ALTER TABLE "_pages_v_blocks_featured_products" ADD COLUMN IF NOT EXISTS "style_overrides" jsonb;
    ALTER TABLE "_pages_v_blocks_featured_products" ADD COLUMN IF NOT EXISTS "_uuid" varchar;
    ALTER TABLE "_pages_v_blocks_featured_products" ADD COLUMN IF NOT EXISTS "block_name" varchar;

    ALTER TABLE "_pages_v_blocks_about" ADD COLUMN IF NOT EXISTS "badge" varchar;
    ALTER TABLE "_pages_v_blocks_about" ADD COLUMN IF NOT EXISTS "heading" varchar;
    ALTER TABLE "_pages_v_blocks_about" ADD COLUMN IF NOT EXISTS "content" jsonb;
    ALTER TABLE "_pages_v_blocks_about" ADD COLUMN IF NOT EXISTS "image_id" integer;
    ALTER TABLE "_pages_v_blocks_about" ADD COLUMN IF NOT EXISTS "cta_text" varchar;
    ALTER TABLE "_pages_v_blocks_about" ADD COLUMN IF NOT EXISTS "cta_link" varchar;
    ALTER TABLE "_pages_v_blocks_about" ADD COLUMN IF NOT EXISTS "animation" varchar;
    ALTER TABLE "_pages_v_blocks_about" ADD COLUMN IF NOT EXISTS "animation_duration" numeric;
    ALTER TABLE "_pages_v_blocks_about" ADD COLUMN IF NOT EXISTS "animation_delay" numeric;
    ALTER TABLE "_pages_v_blocks_about" ADD COLUMN IF NOT EXISTS "animation_easing" varchar;
    ALTER TABLE "_pages_v_blocks_about" ADD COLUMN IF NOT EXISTS "animation_iterations" varchar;
    ALTER TABLE "_pages_v_blocks_about" ADD COLUMN IF NOT EXISTS "style_overrides" jsonb;
    ALTER TABLE "_pages_v_blocks_about" ADD COLUMN IF NOT EXISTS "_uuid" varchar;
    ALTER TABLE "_pages_v_blocks_about" ADD COLUMN IF NOT EXISTS "block_name" varchar;
    ALTER TABLE "_pages_v_blocks_about_highlights" ADD COLUMN IF NOT EXISTS "text" varchar;
    ALTER TABLE "_pages_v_blocks_about_highlights" ADD COLUMN IF NOT EXISTS "_uuid" varchar;

    ALTER TABLE "_pages_v_blocks_rich_text" ADD COLUMN IF NOT EXISTS "content" jsonb;
    ALTER TABLE "_pages_v_blocks_rich_text" ADD COLUMN IF NOT EXISTS "animation" varchar;
    ALTER TABLE "_pages_v_blocks_rich_text" ADD COLUMN IF NOT EXISTS "animation_duration" numeric;
    ALTER TABLE "_pages_v_blocks_rich_text" ADD COLUMN IF NOT EXISTS "animation_delay" numeric;
    ALTER TABLE "_pages_v_blocks_rich_text" ADD COLUMN IF NOT EXISTS "animation_easing" varchar;
    ALTER TABLE "_pages_v_blocks_rich_text" ADD COLUMN IF NOT EXISTS "animation_iterations" varchar;
    ALTER TABLE "_pages_v_blocks_rich_text" ADD COLUMN IF NOT EXISTS "style_overrides" jsonb;
    ALTER TABLE "_pages_v_blocks_rich_text" ADD COLUMN IF NOT EXISTS "_uuid" varchar;
    ALTER TABLE "_pages_v_blocks_rich_text" ADD COLUMN IF NOT EXISTS "block_name" varchar;

    ALTER TABLE "_pages_v_blocks_gallery" ADD COLUMN IF NOT EXISTS "animation" varchar;
    ALTER TABLE "_pages_v_blocks_gallery" ADD COLUMN IF NOT EXISTS "animation_duration" numeric;
    ALTER TABLE "_pages_v_blocks_gallery" ADD COLUMN IF NOT EXISTS "animation_delay" numeric;
    ALTER TABLE "_pages_v_blocks_gallery" ADD COLUMN IF NOT EXISTS "animation_easing" varchar;
    ALTER TABLE "_pages_v_blocks_gallery" ADD COLUMN IF NOT EXISTS "animation_iterations" varchar;
    ALTER TABLE "_pages_v_blocks_gallery" ADD COLUMN IF NOT EXISTS "style_overrides" jsonb;
    ALTER TABLE "_pages_v_blocks_gallery" ADD COLUMN IF NOT EXISTS "_uuid" varchar;
    ALTER TABLE "_pages_v_blocks_gallery" ADD COLUMN IF NOT EXISTS "block_name" varchar;
    ALTER TABLE "_pages_v_blocks_gallery_images" ADD COLUMN IF NOT EXISTS "image_id" integer;
    ALTER TABLE "_pages_v_blocks_gallery_images" ADD COLUMN IF NOT EXISTS "_uuid" varchar;

    ALTER TABLE "_pages_v_blocks_gallery_full" ADD COLUMN IF NOT EXISTS "heading" varchar;
    ALTER TABLE "_pages_v_blocks_gallery_full" ADD COLUMN IF NOT EXISTS "animation" varchar;
    ALTER TABLE "_pages_v_blocks_gallery_full" ADD COLUMN IF NOT EXISTS "animation_duration" numeric;
    ALTER TABLE "_pages_v_blocks_gallery_full" ADD COLUMN IF NOT EXISTS "animation_delay" numeric;
    ALTER TABLE "_pages_v_blocks_gallery_full" ADD COLUMN IF NOT EXISTS "animation_easing" varchar;
    ALTER TABLE "_pages_v_blocks_gallery_full" ADD COLUMN IF NOT EXISTS "animation_iterations" varchar;
    ALTER TABLE "_pages_v_blocks_gallery_full" ADD COLUMN IF NOT EXISTS "style_overrides" jsonb;
    ALTER TABLE "_pages_v_blocks_gallery_full" ADD COLUMN IF NOT EXISTS "_uuid" varchar;
    ALTER TABLE "_pages_v_blocks_gallery_full" ADD COLUMN IF NOT EXISTS "block_name" varchar;
    ALTER TABLE "_pages_v_blocks_gallery_full_items" ADD COLUMN IF NOT EXISTS "image_id" integer;
    ALTER TABLE "_pages_v_blocks_gallery_full_items" ADD COLUMN IF NOT EXISTS "alt" varchar;
    ALTER TABLE "_pages_v_blocks_gallery_full_items" ADD COLUMN IF NOT EXISTS "category" varchar;
    ALTER TABLE "_pages_v_blocks_gallery_full_items" ADD COLUMN IF NOT EXISTS "category_label" varchar;
    ALTER TABLE "_pages_v_blocks_gallery_full_items" ADD COLUMN IF NOT EXISTS "_uuid" varchar;

    ALTER TABLE "_pages_v_blocks_testimonials" ADD COLUMN IF NOT EXISTS "heading" varchar;
    ALTER TABLE "_pages_v_blocks_testimonials" ADD COLUMN IF NOT EXISTS "animation" varchar;
    ALTER TABLE "_pages_v_blocks_testimonials" ADD COLUMN IF NOT EXISTS "animation_duration" numeric;
    ALTER TABLE "_pages_v_blocks_testimonials" ADD COLUMN IF NOT EXISTS "animation_delay" numeric;
    ALTER TABLE "_pages_v_blocks_testimonials" ADD COLUMN IF NOT EXISTS "animation_easing" varchar;
    ALTER TABLE "_pages_v_blocks_testimonials" ADD COLUMN IF NOT EXISTS "animation_iterations" varchar;
    ALTER TABLE "_pages_v_blocks_testimonials" ADD COLUMN IF NOT EXISTS "style_overrides" jsonb;
    ALTER TABLE "_pages_v_blocks_testimonials" ADD COLUMN IF NOT EXISTS "_uuid" varchar;
    ALTER TABLE "_pages_v_blocks_testimonials" ADD COLUMN IF NOT EXISTS "block_name" varchar;
    ALTER TABLE "_pages_v_blocks_testimonials_items" ADD COLUMN IF NOT EXISTS "quote" varchar;
    ALTER TABLE "_pages_v_blocks_testimonials_items" ADD COLUMN IF NOT EXISTS "author" varchar;
    ALTER TABLE "_pages_v_blocks_testimonials_items" ADD COLUMN IF NOT EXISTS "event" varchar;
    ALTER TABLE "_pages_v_blocks_testimonials_items" ADD COLUMN IF NOT EXISTS "rating" numeric DEFAULT 5;
    ALTER TABLE "_pages_v_blocks_testimonials_items" ADD COLUMN IF NOT EXISTS "_uuid" varchar;

    ALTER TABLE "_pages_v_blocks_cta" ADD COLUMN IF NOT EXISTS "heading" varchar;
    ALTER TABLE "_pages_v_blocks_cta" ADD COLUMN IF NOT EXISTS "text" varchar;
    ALTER TABLE "_pages_v_blocks_cta" ADD COLUMN IF NOT EXISTS "button_text" varchar;
    ALTER TABLE "_pages_v_blocks_cta" ADD COLUMN IF NOT EXISTS "button_link" varchar;
    ALTER TABLE "_pages_v_blocks_cta" ADD COLUMN IF NOT EXISTS "variant" varchar DEFAULT 'primary';
    ALTER TABLE "_pages_v_blocks_cta" ADD COLUMN IF NOT EXISTS "phone_number" varchar;
    ALTER TABLE "_pages_v_blocks_cta" ADD COLUMN IF NOT EXISTS "secondary_button_text" varchar;
    ALTER TABLE "_pages_v_blocks_cta" ADD COLUMN IF NOT EXISTS "secondary_button_link" varchar;
    ALTER TABLE "_pages_v_blocks_cta" ADD COLUMN IF NOT EXISTS "animation" varchar;
    ALTER TABLE "_pages_v_blocks_cta" ADD COLUMN IF NOT EXISTS "animation_duration" numeric;
    ALTER TABLE "_pages_v_blocks_cta" ADD COLUMN IF NOT EXISTS "animation_delay" numeric;
    ALTER TABLE "_pages_v_blocks_cta" ADD COLUMN IF NOT EXISTS "animation_easing" varchar;
    ALTER TABLE "_pages_v_blocks_cta" ADD COLUMN IF NOT EXISTS "animation_iterations" varchar;
    ALTER TABLE "_pages_v_blocks_cta" ADD COLUMN IF NOT EXISTS "style_overrides" jsonb;
    ALTER TABLE "_pages_v_blocks_cta" ADD COLUMN IF NOT EXISTS "_uuid" varchar;
    ALTER TABLE "_pages_v_blocks_cta" ADD COLUMN IF NOT EXISTS "block_name" varchar;

    ALTER TABLE "_pages_v_blocks_faq" ADD COLUMN IF NOT EXISTS "animation" varchar;
    ALTER TABLE "_pages_v_blocks_faq" ADD COLUMN IF NOT EXISTS "animation_duration" numeric;
    ALTER TABLE "_pages_v_blocks_faq" ADD COLUMN IF NOT EXISTS "animation_delay" numeric;
    ALTER TABLE "_pages_v_blocks_faq" ADD COLUMN IF NOT EXISTS "animation_easing" varchar;
    ALTER TABLE "_pages_v_blocks_faq" ADD COLUMN IF NOT EXISTS "animation_iterations" varchar;
    ALTER TABLE "_pages_v_blocks_faq" ADD COLUMN IF NOT EXISTS "style_overrides" jsonb;
    ALTER TABLE "_pages_v_blocks_faq" ADD COLUMN IF NOT EXISTS "_uuid" varchar;
    ALTER TABLE "_pages_v_blocks_faq" ADD COLUMN IF NOT EXISTS "block_name" varchar;
    ALTER TABLE "_pages_v_blocks_faq_items" ADD COLUMN IF NOT EXISTS "question" varchar;
    ALTER TABLE "_pages_v_blocks_faq_items" ADD COLUMN IF NOT EXISTS "answer" varchar;
    ALTER TABLE "_pages_v_blocks_faq_items" ADD COLUMN IF NOT EXISTS "_uuid" varchar;

    ALTER TABLE "_pages_v_blocks_pricing" ADD COLUMN IF NOT EXISTS "heading" varchar;
    ALTER TABLE "_pages_v_blocks_pricing" ADD COLUMN IF NOT EXISTS "subheading" varchar;
    ALTER TABLE "_pages_v_blocks_pricing" ADD COLUMN IF NOT EXISTS "animation" varchar;
    ALTER TABLE "_pages_v_blocks_pricing" ADD COLUMN IF NOT EXISTS "animation_duration" numeric;
    ALTER TABLE "_pages_v_blocks_pricing" ADD COLUMN IF NOT EXISTS "animation_delay" numeric;
    ALTER TABLE "_pages_v_blocks_pricing" ADD COLUMN IF NOT EXISTS "animation_easing" varchar;
    ALTER TABLE "_pages_v_blocks_pricing" ADD COLUMN IF NOT EXISTS "animation_iterations" varchar;
    ALTER TABLE "_pages_v_blocks_pricing" ADD COLUMN IF NOT EXISTS "style_overrides" jsonb;
    ALTER TABLE "_pages_v_blocks_pricing" ADD COLUMN IF NOT EXISTS "_uuid" varchar;
    ALTER TABLE "_pages_v_blocks_pricing" ADD COLUMN IF NOT EXISTS "block_name" varchar;
    ALTER TABLE "_pages_v_blocks_pricing_packages" ADD COLUMN IF NOT EXISTS "name" varchar;
    ALTER TABLE "_pages_v_blocks_pricing_packages" ADD COLUMN IF NOT EXISTS "price" varchar;
    ALTER TABLE "_pages_v_blocks_pricing_packages" ADD COLUMN IF NOT EXISTS "cta_text" varchar;
    ALTER TABLE "_pages_v_blocks_pricing_packages" ADD COLUMN IF NOT EXISTS "cta_link" varchar;
    ALTER TABLE "_pages_v_blocks_pricing_packages" ADD COLUMN IF NOT EXISTS "featured" boolean DEFAULT false;
    ALTER TABLE "_pages_v_blocks_pricing_packages" ADD COLUMN IF NOT EXISTS "_uuid" varchar;
    ALTER TABLE "_pages_v_blocks_pricing_packages_features" ADD COLUMN IF NOT EXISTS "text" varchar;
    ALTER TABLE "_pages_v_blocks_pricing_packages_features" ADD COLUMN IF NOT EXISTS "_uuid" varchar;

    ALTER TABLE "_pages_v_blocks_steps" ADD COLUMN IF NOT EXISTS "heading" varchar;
    ALTER TABLE "_pages_v_blocks_steps" ADD COLUMN IF NOT EXISTS "animation" varchar;
    ALTER TABLE "_pages_v_blocks_steps" ADD COLUMN IF NOT EXISTS "animation_duration" numeric;
    ALTER TABLE "_pages_v_blocks_steps" ADD COLUMN IF NOT EXISTS "animation_delay" numeric;
    ALTER TABLE "_pages_v_blocks_steps" ADD COLUMN IF NOT EXISTS "animation_easing" varchar;
    ALTER TABLE "_pages_v_blocks_steps" ADD COLUMN IF NOT EXISTS "animation_iterations" varchar;
    ALTER TABLE "_pages_v_blocks_steps" ADD COLUMN IF NOT EXISTS "style_overrides" jsonb;
    ALTER TABLE "_pages_v_blocks_steps" ADD COLUMN IF NOT EXISTS "_uuid" varchar;
    ALTER TABLE "_pages_v_blocks_steps" ADD COLUMN IF NOT EXISTS "block_name" varchar;
    ALTER TABLE "_pages_v_blocks_steps_steps" ADD COLUMN IF NOT EXISTS "emoji" varchar;
    ALTER TABLE "_pages_v_blocks_steps_steps" ADD COLUMN IF NOT EXISTS "title" varchar;
    ALTER TABLE "_pages_v_blocks_steps_steps" ADD COLUMN IF NOT EXISTS "description" varchar;
    ALTER TABLE "_pages_v_blocks_steps_steps" ADD COLUMN IF NOT EXISTS "_uuid" varchar;

    ALTER TABLE "_pages_v_blocks_contact_form" ADD COLUMN IF NOT EXISTS "heading" varchar;
    ALTER TABLE "_pages_v_blocks_contact_form" ADD COLUMN IF NOT EXISTS "subheading" varchar;
    ALTER TABLE "_pages_v_blocks_contact_form" ADD COLUMN IF NOT EXISTS "animation" varchar;
    ALTER TABLE "_pages_v_blocks_contact_form" ADD COLUMN IF NOT EXISTS "animation_duration" numeric;
    ALTER TABLE "_pages_v_blocks_contact_form" ADD COLUMN IF NOT EXISTS "animation_delay" numeric;
    ALTER TABLE "_pages_v_blocks_contact_form" ADD COLUMN IF NOT EXISTS "animation_easing" varchar;
    ALTER TABLE "_pages_v_blocks_contact_form" ADD COLUMN IF NOT EXISTS "animation_iterations" varchar;
    ALTER TABLE "_pages_v_blocks_contact_form" ADD COLUMN IF NOT EXISTS "style_overrides" jsonb;
    ALTER TABLE "_pages_v_blocks_contact_form" ADD COLUMN IF NOT EXISTS "_uuid" varchar;
    ALTER TABLE "_pages_v_blocks_contact_form" ADD COLUMN IF NOT EXISTS "block_name" varchar;

    ALTER TABLE "_pages_v_blocks_legal_text" ADD COLUMN IF NOT EXISTS "heading" varchar;
    ALTER TABLE "_pages_v_blocks_legal_text" ADD COLUMN IF NOT EXISTS "effective_date" timestamp(3) with time zone;
    ALTER TABLE "_pages_v_blocks_legal_text" ADD COLUMN IF NOT EXISTS "content" jsonb;
    ALTER TABLE "_pages_v_blocks_legal_text" ADD COLUMN IF NOT EXISTS "animation" varchar;
    ALTER TABLE "_pages_v_blocks_legal_text" ADD COLUMN IF NOT EXISTS "animation_duration" numeric;
    ALTER TABLE "_pages_v_blocks_legal_text" ADD COLUMN IF NOT EXISTS "animation_delay" numeric;
    ALTER TABLE "_pages_v_blocks_legal_text" ADD COLUMN IF NOT EXISTS "animation_easing" varchar;
    ALTER TABLE "_pages_v_blocks_legal_text" ADD COLUMN IF NOT EXISTS "animation_iterations" varchar;
    ALTER TABLE "_pages_v_blocks_legal_text" ADD COLUMN IF NOT EXISTS "style_overrides" jsonb;
    ALTER TABLE "_pages_v_blocks_legal_text" ADD COLUMN IF NOT EXISTS "_uuid" varchar;
    ALTER TABLE "_pages_v_blocks_legal_text" ADD COLUMN IF NOT EXISTS "block_name" varchar;

    ALTER TABLE "_pages_v_blocks_partners" ADD COLUMN IF NOT EXISTS "heading" varchar;
    ALTER TABLE "_pages_v_blocks_partners" ADD COLUMN IF NOT EXISTS "variant" varchar DEFAULT 'grid';
    ALTER TABLE "_pages_v_blocks_partners" ADD COLUMN IF NOT EXISTS "grayscale" boolean DEFAULT true;
    ALTER TABLE "_pages_v_blocks_partners" ADD COLUMN IF NOT EXISTS "animation" varchar;
    ALTER TABLE "_pages_v_blocks_partners" ADD COLUMN IF NOT EXISTS "animation_duration" numeric;
    ALTER TABLE "_pages_v_blocks_partners" ADD COLUMN IF NOT EXISTS "animation_delay" numeric;
    ALTER TABLE "_pages_v_blocks_partners" ADD COLUMN IF NOT EXISTS "animation_easing" varchar;
    ALTER TABLE "_pages_v_blocks_partners" ADD COLUMN IF NOT EXISTS "animation_iterations" varchar;
    ALTER TABLE "_pages_v_blocks_partners" ADD COLUMN IF NOT EXISTS "style_overrides" jsonb;
    ALTER TABLE "_pages_v_blocks_partners" ADD COLUMN IF NOT EXISTS "_uuid" varchar;
    ALTER TABLE "_pages_v_blocks_partners" ADD COLUMN IF NOT EXISTS "block_name" varchar;
    ALTER TABLE "_pages_v_blocks_partners_items" ADD COLUMN IF NOT EXISTS "logo_id" integer;
    ALTER TABLE "_pages_v_blocks_partners_items" ADD COLUMN IF NOT EXISTS "name" varchar;
    ALTER TABLE "_pages_v_blocks_partners_items" ADD COLUMN IF NOT EXISTS "url" varchar;
    ALTER TABLE "_pages_v_blocks_partners_items" ADD COLUMN IF NOT EXISTS "_uuid" varchar;

    ALTER TABLE "_pages_v_blocks_team" ADD COLUMN IF NOT EXISTS "heading" varchar;
    ALTER TABLE "_pages_v_blocks_team" ADD COLUMN IF NOT EXISTS "animation" varchar;
    ALTER TABLE "_pages_v_blocks_team" ADD COLUMN IF NOT EXISTS "animation_duration" numeric;
    ALTER TABLE "_pages_v_blocks_team" ADD COLUMN IF NOT EXISTS "animation_delay" numeric;
    ALTER TABLE "_pages_v_blocks_team" ADD COLUMN IF NOT EXISTS "animation_easing" varchar;
    ALTER TABLE "_pages_v_blocks_team" ADD COLUMN IF NOT EXISTS "animation_iterations" varchar;
    ALTER TABLE "_pages_v_blocks_team" ADD COLUMN IF NOT EXISTS "style_overrides" jsonb;
    ALTER TABLE "_pages_v_blocks_team" ADD COLUMN IF NOT EXISTS "_uuid" varchar;
    ALTER TABLE "_pages_v_blocks_team" ADD COLUMN IF NOT EXISTS "block_name" varchar;
    ALTER TABLE "_pages_v_blocks_team_people" ADD COLUMN IF NOT EXISTS "photo_id" integer;
    ALTER TABLE "_pages_v_blocks_team_people" ADD COLUMN IF NOT EXISTS "name" varchar;
    ALTER TABLE "_pages_v_blocks_team_people" ADD COLUMN IF NOT EXISTS "role" varchar;
    ALTER TABLE "_pages_v_blocks_team_people" ADD COLUMN IF NOT EXISTS "bio" varchar;
    ALTER TABLE "_pages_v_blocks_team_people" ADD COLUMN IF NOT EXISTS "_uuid" varchar;
    ALTER TABLE "_pages_v_blocks_team_people_socials" ADD COLUMN IF NOT EXISTS "label" varchar;
    ALTER TABLE "_pages_v_blocks_team_people_socials" ADD COLUMN IF NOT EXISTS "url" varchar;
    ALTER TABLE "_pages_v_blocks_team_people_socials" ADD COLUMN IF NOT EXISTS "_uuid" varchar;

    ALTER TABLE "_pages_v_blocks_map_area" ADD COLUMN IF NOT EXISTS "heading" varchar;
    ALTER TABLE "_pages_v_blocks_map_area" ADD COLUMN IF NOT EXISTS "description" varchar;
    ALTER TABLE "_pages_v_blocks_map_area" ADD COLUMN IF NOT EXISTS "embed_url" varchar;
    ALTER TABLE "_pages_v_blocks_map_area" ADD COLUMN IF NOT EXISTS "note" varchar;
    ALTER TABLE "_pages_v_blocks_map_area" ADD COLUMN IF NOT EXISTS "animation" varchar;
    ALTER TABLE "_pages_v_blocks_map_area" ADD COLUMN IF NOT EXISTS "animation_duration" numeric;
    ALTER TABLE "_pages_v_blocks_map_area" ADD COLUMN IF NOT EXISTS "animation_delay" numeric;
    ALTER TABLE "_pages_v_blocks_map_area" ADD COLUMN IF NOT EXISTS "animation_easing" varchar;
    ALTER TABLE "_pages_v_blocks_map_area" ADD COLUMN IF NOT EXISTS "animation_iterations" varchar;
    ALTER TABLE "_pages_v_blocks_map_area" ADD COLUMN IF NOT EXISTS "style_overrides" jsonb;
    ALTER TABLE "_pages_v_blocks_map_area" ADD COLUMN IF NOT EXISTS "_uuid" varchar;
    ALTER TABLE "_pages_v_blocks_map_area" ADD COLUMN IF NOT EXISTS "block_name" varchar;
    ALTER TABLE "_pages_v_blocks_map_area_cities" ADD COLUMN IF NOT EXISTS "name" varchar;
    ALTER TABLE "_pages_v_blocks_map_area_cities" ADD COLUMN IF NOT EXISTS "_uuid" varchar;

    ALTER TABLE "_pages_v_blocks_offer_cards" ADD COLUMN IF NOT EXISTS "heading" varchar;
    ALTER TABLE "_pages_v_blocks_offer_cards" ADD COLUMN IF NOT EXISTS "animation" varchar;
    ALTER TABLE "_pages_v_blocks_offer_cards" ADD COLUMN IF NOT EXISTS "animation_duration" numeric;
    ALTER TABLE "_pages_v_blocks_offer_cards" ADD COLUMN IF NOT EXISTS "animation_delay" numeric;
    ALTER TABLE "_pages_v_blocks_offer_cards" ADD COLUMN IF NOT EXISTS "animation_easing" varchar;
    ALTER TABLE "_pages_v_blocks_offer_cards" ADD COLUMN IF NOT EXISTS "animation_iterations" varchar;
    ALTER TABLE "_pages_v_blocks_offer_cards" ADD COLUMN IF NOT EXISTS "style_overrides" jsonb;
    ALTER TABLE "_pages_v_blocks_offer_cards" ADD COLUMN IF NOT EXISTS "_uuid" varchar;
    ALTER TABLE "_pages_v_blocks_offer_cards" ADD COLUMN IF NOT EXISTS "block_name" varchar;
    ALTER TABLE "_pages_v_blocks_offer_cards_cards" ADD COLUMN IF NOT EXISTS "title" varchar;
    ALTER TABLE "_pages_v_blocks_offer_cards_cards" ADD COLUMN IF NOT EXISTS "price_from" varchar;
    ALTER TABLE "_pages_v_blocks_offer_cards_cards" ADD COLUMN IF NOT EXISTS "badge" varchar;
    ALTER TABLE "_pages_v_blocks_offer_cards_cards" ADD COLUMN IF NOT EXISTS "featured" boolean DEFAULT false;
    ALTER TABLE "_pages_v_blocks_offer_cards_cards" ADD COLUMN IF NOT EXISTS "cta_text" varchar;
    ALTER TABLE "_pages_v_blocks_offer_cards_cards" ADD COLUMN IF NOT EXISTS "cta_link" varchar;
    ALTER TABLE "_pages_v_blocks_offer_cards_cards" ADD COLUMN IF NOT EXISTS "_uuid" varchar;
    ALTER TABLE "_pages_v_blocks_offer_cards_cards_features" ADD COLUMN IF NOT EXISTS "text" varchar;
    ALTER TABLE "_pages_v_blocks_offer_cards_cards_features" ADD COLUMN IF NOT EXISTS "_uuid" varchar;
  `)

  // ── 7. INDEXES ─────────────────────────────────────────────────────
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "pages_blocks_hero_order_idx" ON "pages_blocks_hero" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "pages_blocks_hero_parent_id_idx" ON "pages_blocks_hero" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "pages_blocks_hero_path_idx" ON "pages_blocks_hero" USING btree ("_path");
    CREATE INDEX IF NOT EXISTS "pages_blocks_hero_background_image_idx" ON "pages_blocks_hero" USING btree ("background_image_id");

    CREATE INDEX IF NOT EXISTS "pages_blocks_stats_order_idx" ON "pages_blocks_stats" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "pages_blocks_stats_parent_id_idx" ON "pages_blocks_stats" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "pages_blocks_stats_path_idx" ON "pages_blocks_stats" USING btree ("_path");
    CREATE INDEX IF NOT EXISTS "pages_blocks_stats_items_order_idx" ON "pages_blocks_stats_items" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "pages_blocks_stats_items_parent_id_idx" ON "pages_blocks_stats_items" USING btree ("_parent_id");

    CREATE INDEX IF NOT EXISTS "pages_blocks_services_order_idx" ON "pages_blocks_services" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "pages_blocks_services_parent_id_idx" ON "pages_blocks_services" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "pages_blocks_services_path_idx" ON "pages_blocks_services" USING btree ("_path");
    CREATE INDEX IF NOT EXISTS "pages_blocks_services_items_order_idx" ON "pages_blocks_services_items" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "pages_blocks_services_items_parent_id_idx" ON "pages_blocks_services_items" USING btree ("_parent_id");

    CREATE INDEX IF NOT EXISTS "pages_blocks_featured_products_order_idx" ON "pages_blocks_featured_products" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "pages_blocks_featured_products_parent_id_idx" ON "pages_blocks_featured_products" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "pages_blocks_featured_products_path_idx" ON "pages_blocks_featured_products" USING btree ("_path");

    CREATE INDEX IF NOT EXISTS "pages_blocks_about_order_idx" ON "pages_blocks_about" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "pages_blocks_about_parent_id_idx" ON "pages_blocks_about" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "pages_blocks_about_path_idx" ON "pages_blocks_about" USING btree ("_path");
    CREATE INDEX IF NOT EXISTS "pages_blocks_about_image_idx" ON "pages_blocks_about" USING btree ("image_id");
    CREATE INDEX IF NOT EXISTS "pages_blocks_about_highlights_order_idx" ON "pages_blocks_about_highlights" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "pages_blocks_about_highlights_parent_id_idx" ON "pages_blocks_about_highlights" USING btree ("_parent_id");

    CREATE INDEX IF NOT EXISTS "pages_blocks_rich_text_order_idx" ON "pages_blocks_rich_text" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "pages_blocks_rich_text_parent_id_idx" ON "pages_blocks_rich_text" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "pages_blocks_rich_text_path_idx" ON "pages_blocks_rich_text" USING btree ("_path");

    CREATE INDEX IF NOT EXISTS "pages_blocks_gallery_order_idx" ON "pages_blocks_gallery" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "pages_blocks_gallery_parent_id_idx" ON "pages_blocks_gallery" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "pages_blocks_gallery_path_idx" ON "pages_blocks_gallery" USING btree ("_path");
    CREATE INDEX IF NOT EXISTS "pages_blocks_gallery_images_order_idx" ON "pages_blocks_gallery_images" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "pages_blocks_gallery_images_parent_id_idx" ON "pages_blocks_gallery_images" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "pages_blocks_gallery_images_image_idx" ON "pages_blocks_gallery_images" USING btree ("image_id");

    CREATE INDEX IF NOT EXISTS "pages_blocks_gallery_full_order_idx" ON "pages_blocks_gallery_full" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "pages_blocks_gallery_full_parent_id_idx" ON "pages_blocks_gallery_full" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "pages_blocks_gallery_full_path_idx" ON "pages_blocks_gallery_full" USING btree ("_path");
    CREATE INDEX IF NOT EXISTS "pages_blocks_gallery_full_items_order_idx" ON "pages_blocks_gallery_full_items" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "pages_blocks_gallery_full_items_parent_id_idx" ON "pages_blocks_gallery_full_items" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "pages_blocks_gallery_full_items_image_idx" ON "pages_blocks_gallery_full_items" USING btree ("image_id");

    CREATE INDEX IF NOT EXISTS "pages_blocks_testimonials_order_idx" ON "pages_blocks_testimonials" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "pages_blocks_testimonials_parent_id_idx" ON "pages_blocks_testimonials" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "pages_blocks_testimonials_path_idx" ON "pages_blocks_testimonials" USING btree ("_path");
    CREATE INDEX IF NOT EXISTS "pages_blocks_testimonials_items_order_idx" ON "pages_blocks_testimonials_items" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "pages_blocks_testimonials_items_parent_id_idx" ON "pages_blocks_testimonials_items" USING btree ("_parent_id");

    CREATE INDEX IF NOT EXISTS "pages_blocks_cta_order_idx" ON "pages_blocks_cta" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "pages_blocks_cta_parent_id_idx" ON "pages_blocks_cta" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "pages_blocks_cta_path_idx" ON "pages_blocks_cta" USING btree ("_path");

    CREATE INDEX IF NOT EXISTS "pages_blocks_faq_order_idx" ON "pages_blocks_faq" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "pages_blocks_faq_parent_id_idx" ON "pages_blocks_faq" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "pages_blocks_faq_path_idx" ON "pages_blocks_faq" USING btree ("_path");
    CREATE INDEX IF NOT EXISTS "pages_blocks_faq_items_order_idx" ON "pages_blocks_faq_items" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "pages_blocks_faq_items_parent_id_idx" ON "pages_blocks_faq_items" USING btree ("_parent_id");

    CREATE INDEX IF NOT EXISTS "pages_blocks_pricing_order_idx" ON "pages_blocks_pricing" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "pages_blocks_pricing_parent_id_idx" ON "pages_blocks_pricing" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "pages_blocks_pricing_path_idx" ON "pages_blocks_pricing" USING btree ("_path");
    CREATE INDEX IF NOT EXISTS "pages_blocks_pricing_packages_order_idx" ON "pages_blocks_pricing_packages" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "pages_blocks_pricing_packages_parent_id_idx" ON "pages_blocks_pricing_packages" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "pages_blocks_pricing_packages_features_order_idx" ON "pages_blocks_pricing_packages_features" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "pages_blocks_pricing_packages_features_parent_id_idx" ON "pages_blocks_pricing_packages_features" USING btree ("_parent_id");

    CREATE INDEX IF NOT EXISTS "pages_blocks_steps_order_idx" ON "pages_blocks_steps" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "pages_blocks_steps_parent_id_idx" ON "pages_blocks_steps" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "pages_blocks_steps_path_idx" ON "pages_blocks_steps" USING btree ("_path");
    CREATE INDEX IF NOT EXISTS "pages_blocks_steps_steps_order_idx" ON "pages_blocks_steps_steps" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "pages_blocks_steps_steps_parent_id_idx" ON "pages_blocks_steps_steps" USING btree ("_parent_id");

    CREATE INDEX IF NOT EXISTS "pages_blocks_contact_form_order_idx" ON "pages_blocks_contact_form" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "pages_blocks_contact_form_parent_id_idx" ON "pages_blocks_contact_form" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "pages_blocks_contact_form_path_idx" ON "pages_blocks_contact_form" USING btree ("_path");

    CREATE INDEX IF NOT EXISTS "pages_blocks_legal_text_order_idx" ON "pages_blocks_legal_text" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "pages_blocks_legal_text_parent_id_idx" ON "pages_blocks_legal_text" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "pages_blocks_legal_text_path_idx" ON "pages_blocks_legal_text" USING btree ("_path");

    CREATE INDEX IF NOT EXISTS "pages_blocks_partners_order_idx" ON "pages_blocks_partners" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "pages_blocks_partners_parent_id_idx" ON "pages_blocks_partners" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "pages_blocks_partners_path_idx" ON "pages_blocks_partners" USING btree ("_path");
    CREATE INDEX IF NOT EXISTS "pages_blocks_partners_items_order_idx" ON "pages_blocks_partners_items" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "pages_blocks_partners_items_parent_id_idx" ON "pages_blocks_partners_items" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "pages_blocks_partners_items_logo_idx" ON "pages_blocks_partners_items" USING btree ("logo_id");

    CREATE INDEX IF NOT EXISTS "pages_blocks_team_order_idx" ON "pages_blocks_team" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "pages_blocks_team_parent_id_idx" ON "pages_blocks_team" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "pages_blocks_team_path_idx" ON "pages_blocks_team" USING btree ("_path");
    CREATE INDEX IF NOT EXISTS "pages_blocks_team_people_order_idx" ON "pages_blocks_team_people" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "pages_blocks_team_people_parent_id_idx" ON "pages_blocks_team_people" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "pages_blocks_team_people_photo_idx" ON "pages_blocks_team_people" USING btree ("photo_id");
    CREATE INDEX IF NOT EXISTS "pages_blocks_team_people_socials_order_idx" ON "pages_blocks_team_people_socials" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "pages_blocks_team_people_socials_parent_id_idx" ON "pages_blocks_team_people_socials" USING btree ("_parent_id");

    CREATE INDEX IF NOT EXISTS "pages_blocks_map_area_order_idx" ON "pages_blocks_map_area" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "pages_blocks_map_area_parent_id_idx" ON "pages_blocks_map_area" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "pages_blocks_map_area_path_idx" ON "pages_blocks_map_area" USING btree ("_path");
    CREATE INDEX IF NOT EXISTS "pages_blocks_map_area_cities_order_idx" ON "pages_blocks_map_area_cities" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "pages_blocks_map_area_cities_parent_id_idx" ON "pages_blocks_map_area_cities" USING btree ("_parent_id");

    CREATE INDEX IF NOT EXISTS "pages_blocks_offer_cards_order_idx" ON "pages_blocks_offer_cards" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "pages_blocks_offer_cards_parent_id_idx" ON "pages_blocks_offer_cards" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "pages_blocks_offer_cards_path_idx" ON "pages_blocks_offer_cards" USING btree ("_path");
    CREATE INDEX IF NOT EXISTS "pages_blocks_offer_cards_cards_order_idx" ON "pages_blocks_offer_cards_cards" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "pages_blocks_offer_cards_cards_parent_id_idx" ON "pages_blocks_offer_cards_cards" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "pages_blocks_offer_cards_cards_features_order_idx" ON "pages_blocks_offer_cards_cards_features" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "pages_blocks_offer_cards_cards_features_parent_id_idx" ON "pages_blocks_offer_cards_cards_features" USING btree ("_parent_id");
  `)

  // ── 8. INDEXES for versioned tables ────────────────────────────────
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_hero_order_idx" ON "_pages_v_blocks_hero" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_hero_parent_id_idx" ON "_pages_v_blocks_hero" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_hero_path_idx" ON "_pages_v_blocks_hero" USING btree ("_path");
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_hero_background_image_idx" ON "_pages_v_blocks_hero" USING btree ("background_image_id");

    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_stats_order_idx" ON "_pages_v_blocks_stats" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_stats_parent_id_idx" ON "_pages_v_blocks_stats" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_stats_path_idx" ON "_pages_v_blocks_stats" USING btree ("_path");
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_stats_items_order_idx" ON "_pages_v_blocks_stats_items" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_stats_items_parent_id_idx" ON "_pages_v_blocks_stats_items" USING btree ("_parent_id");

    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_services_order_idx" ON "_pages_v_blocks_services" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_services_parent_id_idx" ON "_pages_v_blocks_services" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_services_path_idx" ON "_pages_v_blocks_services" USING btree ("_path");
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_services_items_order_idx" ON "_pages_v_blocks_services_items" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_services_items_parent_id_idx" ON "_pages_v_blocks_services_items" USING btree ("_parent_id");

    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_featured_products_order_idx" ON "_pages_v_blocks_featured_products" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_featured_products_parent_id_idx" ON "_pages_v_blocks_featured_products" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_featured_products_path_idx" ON "_pages_v_blocks_featured_products" USING btree ("_path");

    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_about_order_idx" ON "_pages_v_blocks_about" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_about_parent_id_idx" ON "_pages_v_blocks_about" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_about_path_idx" ON "_pages_v_blocks_about" USING btree ("_path");
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_about_image_idx" ON "_pages_v_blocks_about" USING btree ("image_id");
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_about_highlights_order_idx" ON "_pages_v_blocks_about_highlights" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_about_highlights_parent_id_idx" ON "_pages_v_blocks_about_highlights" USING btree ("_parent_id");

    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_rich_text_order_idx" ON "_pages_v_blocks_rich_text" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_rich_text_parent_id_idx" ON "_pages_v_blocks_rich_text" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_rich_text_path_idx" ON "_pages_v_blocks_rich_text" USING btree ("_path");

    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_gallery_order_idx" ON "_pages_v_blocks_gallery" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_gallery_parent_id_idx" ON "_pages_v_blocks_gallery" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_gallery_path_idx" ON "_pages_v_blocks_gallery" USING btree ("_path");
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_gallery_images_order_idx" ON "_pages_v_blocks_gallery_images" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_gallery_images_parent_id_idx" ON "_pages_v_blocks_gallery_images" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_gallery_images_image_idx" ON "_pages_v_blocks_gallery_images" USING btree ("image_id");

    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_gallery_full_order_idx" ON "_pages_v_blocks_gallery_full" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_gallery_full_parent_id_idx" ON "_pages_v_blocks_gallery_full" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_gallery_full_path_idx" ON "_pages_v_blocks_gallery_full" USING btree ("_path");
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_gallery_full_items_order_idx" ON "_pages_v_blocks_gallery_full_items" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_gallery_full_items_parent_id_idx" ON "_pages_v_blocks_gallery_full_items" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_gallery_full_items_image_idx" ON "_pages_v_blocks_gallery_full_items" USING btree ("image_id");

    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_testimonials_order_idx" ON "_pages_v_blocks_testimonials" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_testimonials_parent_id_idx" ON "_pages_v_blocks_testimonials" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_testimonials_path_idx" ON "_pages_v_blocks_testimonials" USING btree ("_path");
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_testimonials_items_order_idx" ON "_pages_v_blocks_testimonials_items" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_testimonials_items_parent_id_idx" ON "_pages_v_blocks_testimonials_items" USING btree ("_parent_id");

    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_cta_order_idx" ON "_pages_v_blocks_cta" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_cta_parent_id_idx" ON "_pages_v_blocks_cta" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_cta_path_idx" ON "_pages_v_blocks_cta" USING btree ("_path");

    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_faq_order_idx" ON "_pages_v_blocks_faq" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_faq_parent_id_idx" ON "_pages_v_blocks_faq" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_faq_path_idx" ON "_pages_v_blocks_faq" USING btree ("_path");
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_faq_items_order_idx" ON "_pages_v_blocks_faq_items" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_faq_items_parent_id_idx" ON "_pages_v_blocks_faq_items" USING btree ("_parent_id");

    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_pricing_order_idx" ON "_pages_v_blocks_pricing" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_pricing_parent_id_idx" ON "_pages_v_blocks_pricing" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_pricing_path_idx" ON "_pages_v_blocks_pricing" USING btree ("_path");
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_pricing_packages_order_idx" ON "_pages_v_blocks_pricing_packages" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_pricing_packages_parent_id_idx" ON "_pages_v_blocks_pricing_packages" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_pricing_packages_features_order_idx" ON "_pages_v_blocks_pricing_packages_features" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_pricing_packages_features_parent_id_idx" ON "_pages_v_blocks_pricing_packages_features" USING btree ("_parent_id");

    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_steps_order_idx" ON "_pages_v_blocks_steps" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_steps_parent_id_idx" ON "_pages_v_blocks_steps" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_steps_path_idx" ON "_pages_v_blocks_steps" USING btree ("_path");
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_steps_steps_order_idx" ON "_pages_v_blocks_steps_steps" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_steps_steps_parent_id_idx" ON "_pages_v_blocks_steps_steps" USING btree ("_parent_id");

    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_contact_form_order_idx" ON "_pages_v_blocks_contact_form" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_contact_form_parent_id_idx" ON "_pages_v_blocks_contact_form" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_contact_form_path_idx" ON "_pages_v_blocks_contact_form" USING btree ("_path");

    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_legal_text_order_idx" ON "_pages_v_blocks_legal_text" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_legal_text_parent_id_idx" ON "_pages_v_blocks_legal_text" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_legal_text_path_idx" ON "_pages_v_blocks_legal_text" USING btree ("_path");

    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_partners_order_idx" ON "_pages_v_blocks_partners" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_partners_parent_id_idx" ON "_pages_v_blocks_partners" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_partners_path_idx" ON "_pages_v_blocks_partners" USING btree ("_path");
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_partners_items_order_idx" ON "_pages_v_blocks_partners_items" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_partners_items_parent_id_idx" ON "_pages_v_blocks_partners_items" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_partners_items_logo_idx" ON "_pages_v_blocks_partners_items" USING btree ("logo_id");

    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_team_order_idx" ON "_pages_v_blocks_team" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_team_parent_id_idx" ON "_pages_v_blocks_team" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_team_path_idx" ON "_pages_v_blocks_team" USING btree ("_path");
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_team_people_order_idx" ON "_pages_v_blocks_team_people" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_team_people_parent_id_idx" ON "_pages_v_blocks_team_people" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_team_people_photo_idx" ON "_pages_v_blocks_team_people" USING btree ("photo_id");
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_team_people_socials_order_idx" ON "_pages_v_blocks_team_people_socials" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_team_people_socials_parent_id_idx" ON "_pages_v_blocks_team_people_socials" USING btree ("_parent_id");

    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_map_area_order_idx" ON "_pages_v_blocks_map_area" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_map_area_parent_id_idx" ON "_pages_v_blocks_map_area" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_map_area_path_idx" ON "_pages_v_blocks_map_area" USING btree ("_path");
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_map_area_cities_order_idx" ON "_pages_v_blocks_map_area_cities" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_map_area_cities_parent_id_idx" ON "_pages_v_blocks_map_area_cities" USING btree ("_parent_id");

    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_offer_cards_order_idx" ON "_pages_v_blocks_offer_cards" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_offer_cards_parent_id_idx" ON "_pages_v_blocks_offer_cards" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_offer_cards_path_idx" ON "_pages_v_blocks_offer_cards" USING btree ("_path");
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_offer_cards_cards_order_idx" ON "_pages_v_blocks_offer_cards_cards" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_offer_cards_cards_parent_id_idx" ON "_pages_v_blocks_offer_cards_cards" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_offer_cards_cards_features_order_idx" ON "_pages_v_blocks_offer_cards_cards_features" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_offer_cards_cards_features_parent_id_idx" ON "_pages_v_blocks_offer_cards_cards_features" USING btree ("_parent_id");
  `)

  // ── 8b. CLEAN UP ORPHANED MEDIA REFERENCES ─────────────────────────
  // Before adding foreign keys, null out any media references that point
  // to non-existent media records (consistent with ON DELETE set null).
  await db.execute(sql`
    UPDATE "pages_blocks_hero" SET "background_image_id" = NULL WHERE "background_image_id" IS NOT NULL AND "background_image_id" NOT IN (SELECT "id" FROM "media");
    UPDATE "pages_blocks_about" SET "image_id" = NULL WHERE "image_id" IS NOT NULL AND "image_id" NOT IN (SELECT "id" FROM "media");
    UPDATE "pages_blocks_gallery_images" SET "image_id" = NULL WHERE "image_id" IS NOT NULL AND "image_id" NOT IN (SELECT "id" FROM "media");
    UPDATE "pages_blocks_gallery_full_items" SET "image_id" = NULL WHERE "image_id" IS NOT NULL AND "image_id" NOT IN (SELECT "id" FROM "media");
    UPDATE "pages_blocks_partners_items" SET "logo_id" = NULL WHERE "logo_id" IS NOT NULL AND "logo_id" NOT IN (SELECT "id" FROM "media");
    UPDATE "pages_blocks_team_people" SET "photo_id" = NULL WHERE "photo_id" IS NOT NULL AND "photo_id" NOT IN (SELECT "id" FROM "media");

    UPDATE "_pages_v_blocks_hero" SET "background_image_id" = NULL WHERE "background_image_id" IS NOT NULL AND "background_image_id" NOT IN (SELECT "id" FROM "media");
    UPDATE "_pages_v_blocks_about" SET "image_id" = NULL WHERE "image_id" IS NOT NULL AND "image_id" NOT IN (SELECT "id" FROM "media");
    UPDATE "_pages_v_blocks_gallery_images" SET "image_id" = NULL WHERE "image_id" IS NOT NULL AND "image_id" NOT IN (SELECT "id" FROM "media");
    UPDATE "_pages_v_blocks_gallery_full_items" SET "image_id" = NULL WHERE "image_id" IS NOT NULL AND "image_id" NOT IN (SELECT "id" FROM "media");
    UPDATE "_pages_v_blocks_partners_items" SET "logo_id" = NULL WHERE "logo_id" IS NOT NULL AND "logo_id" NOT IN (SELECT "id" FROM "media");
    UPDATE "_pages_v_blocks_team_people" SET "photo_id" = NULL WHERE "photo_id" IS NOT NULL AND "photo_id" NOT IN (SELECT "id" FROM "media");
  `)

  // ── 8c. CLEAN UP ORPHANED _parent_id REFERENCES ──────────────────────
  // Delete rows whose _parent_id points to a non-existent parent record
  // (consistent with ON DELETE cascade). Process top-down so that deleting
  // a level-1 orphan exposes level-2 orphans in the next pass.
  await db.execute(sql`
    DELETE FROM "pages_blocks_hero" WHERE "_parent_id" IS NOT NULL AND "_parent_id" NOT IN (SELECT "id" FROM "pages");
    DELETE FROM "pages_blocks_stats" WHERE "_parent_id" IS NOT NULL AND "_parent_id" NOT IN (SELECT "id" FROM "pages");
    DELETE FROM "pages_blocks_services" WHERE "_parent_id" IS NOT NULL AND "_parent_id" NOT IN (SELECT "id" FROM "pages");
    DELETE FROM "pages_blocks_featured_products" WHERE "_parent_id" IS NOT NULL AND "_parent_id" NOT IN (SELECT "id" FROM "pages");
    DELETE FROM "pages_blocks_about" WHERE "_parent_id" IS NOT NULL AND "_parent_id" NOT IN (SELECT "id" FROM "pages");
    DELETE FROM "pages_blocks_rich_text" WHERE "_parent_id" IS NOT NULL AND "_parent_id" NOT IN (SELECT "id" FROM "pages");
    DELETE FROM "pages_blocks_gallery" WHERE "_parent_id" IS NOT NULL AND "_parent_id" NOT IN (SELECT "id" FROM "pages");
    DELETE FROM "pages_blocks_gallery_full" WHERE "_parent_id" IS NOT NULL AND "_parent_id" NOT IN (SELECT "id" FROM "pages");
    DELETE FROM "pages_blocks_testimonials" WHERE "_parent_id" IS NOT NULL AND "_parent_id" NOT IN (SELECT "id" FROM "pages");
    DELETE FROM "pages_blocks_cta" WHERE "_parent_id" IS NOT NULL AND "_parent_id" NOT IN (SELECT "id" FROM "pages");
    DELETE FROM "pages_blocks_faq" WHERE "_parent_id" IS NOT NULL AND "_parent_id" NOT IN (SELECT "id" FROM "pages");
    DELETE FROM "pages_blocks_pricing" WHERE "_parent_id" IS NOT NULL AND "_parent_id" NOT IN (SELECT "id" FROM "pages");
    DELETE FROM "pages_blocks_steps" WHERE "_parent_id" IS NOT NULL AND "_parent_id" NOT IN (SELECT "id" FROM "pages");
    DELETE FROM "pages_blocks_contact_form" WHERE "_parent_id" IS NOT NULL AND "_parent_id" NOT IN (SELECT "id" FROM "pages");
    DELETE FROM "pages_blocks_legal_text" WHERE "_parent_id" IS NOT NULL AND "_parent_id" NOT IN (SELECT "id" FROM "pages");
    DELETE FROM "pages_blocks_partners" WHERE "_parent_id" IS NOT NULL AND "_parent_id" NOT IN (SELECT "id" FROM "pages");
    DELETE FROM "pages_blocks_team" WHERE "_parent_id" IS NOT NULL AND "_parent_id" NOT IN (SELECT "id" FROM "pages");
    DELETE FROM "pages_blocks_map_area" WHERE "_parent_id" IS NOT NULL AND "_parent_id" NOT IN (SELECT "id" FROM "pages");
    DELETE FROM "pages_blocks_offer_cards" WHERE "_parent_id" IS NOT NULL AND "_parent_id" NOT IN (SELECT "id" FROM "pages");

    DELETE FROM "pages_blocks_stats_items" WHERE "_parent_id" IS NOT NULL AND "_parent_id" NOT IN (SELECT "id" FROM "pages_blocks_stats");
    DELETE FROM "pages_blocks_services_items" WHERE "_parent_id" IS NOT NULL AND "_parent_id" NOT IN (SELECT "id" FROM "pages_blocks_services");
    DELETE FROM "pages_blocks_about_highlights" WHERE "_parent_id" IS NOT NULL AND "_parent_id" NOT IN (SELECT "id" FROM "pages_blocks_about");
    DELETE FROM "pages_blocks_gallery_images" WHERE "_parent_id" IS NOT NULL AND "_parent_id" NOT IN (SELECT "id" FROM "pages_blocks_gallery");
    DELETE FROM "pages_blocks_gallery_full_items" WHERE "_parent_id" IS NOT NULL AND "_parent_id" NOT IN (SELECT "id" FROM "pages_blocks_gallery_full");
    DELETE FROM "pages_blocks_testimonials_items" WHERE "_parent_id" IS NOT NULL AND "_parent_id" NOT IN (SELECT "id" FROM "pages_blocks_testimonials");
    DELETE FROM "pages_blocks_faq_items" WHERE "_parent_id" IS NOT NULL AND "_parent_id" NOT IN (SELECT "id" FROM "pages_blocks_faq");
    DELETE FROM "pages_blocks_pricing_packages" WHERE "_parent_id" IS NOT NULL AND "_parent_id" NOT IN (SELECT "id" FROM "pages_blocks_pricing");
    DELETE FROM "pages_blocks_steps_steps" WHERE "_parent_id" IS NOT NULL AND "_parent_id" NOT IN (SELECT "id" FROM "pages_blocks_steps");
    DELETE FROM "pages_blocks_partners_items" WHERE "_parent_id" IS NOT NULL AND "_parent_id" NOT IN (SELECT "id" FROM "pages_blocks_partners");
    DELETE FROM "pages_blocks_team_people" WHERE "_parent_id" IS NOT NULL AND "_parent_id" NOT IN (SELECT "id" FROM "pages_blocks_team");
    DELETE FROM "pages_blocks_map_area_cities" WHERE "_parent_id" IS NOT NULL AND "_parent_id" NOT IN (SELECT "id" FROM "pages_blocks_map_area");
    DELETE FROM "pages_blocks_offer_cards_cards" WHERE "_parent_id" IS NOT NULL AND "_parent_id" NOT IN (SELECT "id" FROM "pages_blocks_offer_cards");

    DELETE FROM "pages_blocks_pricing_packages_features" WHERE "_parent_id" IS NOT NULL AND "_parent_id" NOT IN (SELECT "id" FROM "pages_blocks_pricing_packages");
    DELETE FROM "pages_blocks_team_people_socials" WHERE "_parent_id" IS NOT NULL AND "_parent_id" NOT IN (SELECT "id" FROM "pages_blocks_team_people");
    DELETE FROM "pages_blocks_offer_cards_cards_features" WHERE "_parent_id" IS NOT NULL AND "_parent_id" NOT IN (SELECT "id" FROM "pages_blocks_offer_cards_cards");

    DELETE FROM "_pages_v_blocks_hero" WHERE "_parent_id" IS NOT NULL AND "_parent_id" NOT IN (SELECT "id" FROM "_pages_v");
    DELETE FROM "_pages_v_blocks_stats" WHERE "_parent_id" IS NOT NULL AND "_parent_id" NOT IN (SELECT "id" FROM "_pages_v");
    DELETE FROM "_pages_v_blocks_services" WHERE "_parent_id" IS NOT NULL AND "_parent_id" NOT IN (SELECT "id" FROM "_pages_v");
    DELETE FROM "_pages_v_blocks_featured_products" WHERE "_parent_id" IS NOT NULL AND "_parent_id" NOT IN (SELECT "id" FROM "_pages_v");
    DELETE FROM "_pages_v_blocks_about" WHERE "_parent_id" IS NOT NULL AND "_parent_id" NOT IN (SELECT "id" FROM "_pages_v");
    DELETE FROM "_pages_v_blocks_rich_text" WHERE "_parent_id" IS NOT NULL AND "_parent_id" NOT IN (SELECT "id" FROM "_pages_v");
    DELETE FROM "_pages_v_blocks_gallery" WHERE "_parent_id" IS NOT NULL AND "_parent_id" NOT IN (SELECT "id" FROM "_pages_v");
    DELETE FROM "_pages_v_blocks_gallery_full" WHERE "_parent_id" IS NOT NULL AND "_parent_id" NOT IN (SELECT "id" FROM "_pages_v");
    DELETE FROM "_pages_v_blocks_testimonials" WHERE "_parent_id" IS NOT NULL AND "_parent_id" NOT IN (SELECT "id" FROM "_pages_v");
    DELETE FROM "_pages_v_blocks_cta" WHERE "_parent_id" IS NOT NULL AND "_parent_id" NOT IN (SELECT "id" FROM "_pages_v");
    DELETE FROM "_pages_v_blocks_faq" WHERE "_parent_id" IS NOT NULL AND "_parent_id" NOT IN (SELECT "id" FROM "_pages_v");
    DELETE FROM "_pages_v_blocks_pricing" WHERE "_parent_id" IS NOT NULL AND "_parent_id" NOT IN (SELECT "id" FROM "_pages_v");
    DELETE FROM "_pages_v_blocks_steps" WHERE "_parent_id" IS NOT NULL AND "_parent_id" NOT IN (SELECT "id" FROM "_pages_v");
    DELETE FROM "_pages_v_blocks_contact_form" WHERE "_parent_id" IS NOT NULL AND "_parent_id" NOT IN (SELECT "id" FROM "_pages_v");
    DELETE FROM "_pages_v_blocks_legal_text" WHERE "_parent_id" IS NOT NULL AND "_parent_id" NOT IN (SELECT "id" FROM "_pages_v");
    DELETE FROM "_pages_v_blocks_partners" WHERE "_parent_id" IS NOT NULL AND "_parent_id" NOT IN (SELECT "id" FROM "_pages_v");
    DELETE FROM "_pages_v_blocks_team" WHERE "_parent_id" IS NOT NULL AND "_parent_id" NOT IN (SELECT "id" FROM "_pages_v");
    DELETE FROM "_pages_v_blocks_map_area" WHERE "_parent_id" IS NOT NULL AND "_parent_id" NOT IN (SELECT "id" FROM "_pages_v");
    DELETE FROM "_pages_v_blocks_offer_cards" WHERE "_parent_id" IS NOT NULL AND "_parent_id" NOT IN (SELECT "id" FROM "_pages_v");

    DELETE FROM "_pages_v_blocks_stats_items" WHERE "_parent_id" IS NOT NULL AND "_parent_id" NOT IN (SELECT "id" FROM "_pages_v_blocks_stats");
    DELETE FROM "_pages_v_blocks_services_items" WHERE "_parent_id" IS NOT NULL AND "_parent_id" NOT IN (SELECT "id" FROM "_pages_v_blocks_services");
    DELETE FROM "_pages_v_blocks_about_highlights" WHERE "_parent_id" IS NOT NULL AND "_parent_id" NOT IN (SELECT "id" FROM "_pages_v_blocks_about");
    DELETE FROM "_pages_v_blocks_gallery_images" WHERE "_parent_id" IS NOT NULL AND "_parent_id" NOT IN (SELECT "id" FROM "_pages_v_blocks_gallery");
    DELETE FROM "_pages_v_blocks_gallery_full_items" WHERE "_parent_id" IS NOT NULL AND "_parent_id" NOT IN (SELECT "id" FROM "_pages_v_blocks_gallery_full");
    DELETE FROM "_pages_v_blocks_testimonials_items" WHERE "_parent_id" IS NOT NULL AND "_parent_id" NOT IN (SELECT "id" FROM "_pages_v_blocks_testimonials");
    DELETE FROM "_pages_v_blocks_faq_items" WHERE "_parent_id" IS NOT NULL AND "_parent_id" NOT IN (SELECT "id" FROM "_pages_v_blocks_faq");
    DELETE FROM "_pages_v_blocks_pricing_packages" WHERE "_parent_id" IS NOT NULL AND "_parent_id" NOT IN (SELECT "id" FROM "_pages_v_blocks_pricing");
    DELETE FROM "_pages_v_blocks_steps_steps" WHERE "_parent_id" IS NOT NULL AND "_parent_id" NOT IN (SELECT "id" FROM "_pages_v_blocks_steps");
    DELETE FROM "_pages_v_blocks_partners_items" WHERE "_parent_id" IS NOT NULL AND "_parent_id" NOT IN (SELECT "id" FROM "_pages_v_blocks_partners");
    DELETE FROM "_pages_v_blocks_team_people" WHERE "_parent_id" IS NOT NULL AND "_parent_id" NOT IN (SELECT "id" FROM "_pages_v_blocks_team");
    DELETE FROM "_pages_v_blocks_map_area_cities" WHERE "_parent_id" IS NOT NULL AND "_parent_id" NOT IN (SELECT "id" FROM "_pages_v_blocks_map_area");
    DELETE FROM "_pages_v_blocks_offer_cards_cards" WHERE "_parent_id" IS NOT NULL AND "_parent_id" NOT IN (SELECT "id" FROM "_pages_v_blocks_offer_cards");

    DELETE FROM "_pages_v_blocks_pricing_packages_features" WHERE "_parent_id" IS NOT NULL AND "_parent_id" NOT IN (SELECT "id" FROM "_pages_v_blocks_pricing_packages");
    DELETE FROM "_pages_v_blocks_team_people_socials" WHERE "_parent_id" IS NOT NULL AND "_parent_id" NOT IN (SELECT "id" FROM "_pages_v_blocks_team_people");
    DELETE FROM "_pages_v_blocks_offer_cards_cards_features" WHERE "_parent_id" IS NOT NULL AND "_parent_id" NOT IN (SELECT "id" FROM "_pages_v_blocks_offer_cards_cards");
  `)

  // ── 9. FOREIGN KEYS (idempotent via DO/EXCEPTION) ──────────────────
  await db.execute(sql`
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pages_blocks_hero_background_image_id_media_id_fk') THEN
        ALTER TABLE "pages_blocks_hero" ADD CONSTRAINT "pages_blocks_hero_background_image_id_media_id_fk" FOREIGN KEY ("background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pages_blocks_hero_parent_id_fk') THEN
        ALTER TABLE "pages_blocks_hero" ADD CONSTRAINT "pages_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pages_blocks_stats_parent_id_fk') THEN
        ALTER TABLE "pages_blocks_stats" ADD CONSTRAINT "pages_blocks_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pages_blocks_stats_items_parent_id_fk') THEN
        ALTER TABLE "pages_blocks_stats_items" ADD CONSTRAINT "pages_blocks_stats_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_stats"("id") ON DELETE cascade ON UPDATE no action;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pages_blocks_services_parent_id_fk') THEN
        ALTER TABLE "pages_blocks_services" ADD CONSTRAINT "pages_blocks_services_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pages_blocks_services_items_parent_id_fk') THEN
        ALTER TABLE "pages_blocks_services_items" ADD CONSTRAINT "pages_blocks_services_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_services"("id") ON DELETE cascade ON UPDATE no action;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pages_blocks_featured_products_parent_id_fk') THEN
        ALTER TABLE "pages_blocks_featured_products" ADD CONSTRAINT "pages_blocks_featured_products_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pages_blocks_about_image_id_media_id_fk') THEN
        ALTER TABLE "pages_blocks_about" ADD CONSTRAINT "pages_blocks_about_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pages_blocks_about_parent_id_fk') THEN
        ALTER TABLE "pages_blocks_about" ADD CONSTRAINT "pages_blocks_about_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pages_blocks_about_highlights_parent_id_fk') THEN
        ALTER TABLE "pages_blocks_about_highlights" ADD CONSTRAINT "pages_blocks_about_highlights_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_about"("id") ON DELETE cascade ON UPDATE no action;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pages_blocks_rich_text_parent_id_fk') THEN
        ALTER TABLE "pages_blocks_rich_text" ADD CONSTRAINT "pages_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pages_blocks_gallery_parent_id_fk') THEN
        ALTER TABLE "pages_blocks_gallery" ADD CONSTRAINT "pages_blocks_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pages_blocks_gallery_images_image_id_media_id_fk') THEN
        ALTER TABLE "pages_blocks_gallery_images" ADD CONSTRAINT "pages_blocks_gallery_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pages_blocks_gallery_images_parent_id_fk') THEN
        ALTER TABLE "pages_blocks_gallery_images" ADD CONSTRAINT "pages_blocks_gallery_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_gallery"("id") ON DELETE cascade ON UPDATE no action;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pages_blocks_gallery_full_parent_id_fk') THEN
        ALTER TABLE "pages_blocks_gallery_full" ADD CONSTRAINT "pages_blocks_gallery_full_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pages_blocks_gallery_full_items_image_id_media_id_fk') THEN
        ALTER TABLE "pages_blocks_gallery_full_items" ADD CONSTRAINT "pages_blocks_gallery_full_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pages_blocks_gallery_full_items_parent_id_fk') THEN
        ALTER TABLE "pages_blocks_gallery_full_items" ADD CONSTRAINT "pages_blocks_gallery_full_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_gallery_full"("id") ON DELETE cascade ON UPDATE no action;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pages_blocks_testimonials_parent_id_fk') THEN
        ALTER TABLE "pages_blocks_testimonials" ADD CONSTRAINT "pages_blocks_testimonials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pages_blocks_testimonials_items_parent_id_fk') THEN
        ALTER TABLE "pages_blocks_testimonials_items" ADD CONSTRAINT "pages_blocks_testimonials_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_testimonials"("id") ON DELETE cascade ON UPDATE no action;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pages_blocks_cta_parent_id_fk') THEN
        ALTER TABLE "pages_blocks_cta" ADD CONSTRAINT "pages_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pages_blocks_faq_parent_id_fk') THEN
        ALTER TABLE "pages_blocks_faq" ADD CONSTRAINT "pages_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pages_blocks_faq_items_parent_id_fk') THEN
        ALTER TABLE "pages_blocks_faq_items" ADD CONSTRAINT "pages_blocks_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pages_blocks_pricing_parent_id_fk') THEN
        ALTER TABLE "pages_blocks_pricing" ADD CONSTRAINT "pages_blocks_pricing_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pages_blocks_pricing_packages_parent_id_fk') THEN
        ALTER TABLE "pages_blocks_pricing_packages" ADD CONSTRAINT "pages_blocks_pricing_packages_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_pricing"("id") ON DELETE cascade ON UPDATE no action;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pages_blocks_pricing_packages_features_parent_id_fk') THEN
        ALTER TABLE "pages_blocks_pricing_packages_features" ADD CONSTRAINT "pages_blocks_pricing_packages_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_pricing_packages"("id") ON DELETE cascade ON UPDATE no action;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pages_blocks_steps_parent_id_fk') THEN
        ALTER TABLE "pages_blocks_steps" ADD CONSTRAINT "pages_blocks_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pages_blocks_steps_steps_parent_id_fk') THEN
        ALTER TABLE "pages_blocks_steps_steps" ADD CONSTRAINT "pages_blocks_steps_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_steps"("id") ON DELETE cascade ON UPDATE no action;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pages_blocks_contact_form_parent_id_fk') THEN
        ALTER TABLE "pages_blocks_contact_form" ADD CONSTRAINT "pages_blocks_contact_form_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pages_blocks_legal_text_parent_id_fk') THEN
        ALTER TABLE "pages_blocks_legal_text" ADD CONSTRAINT "pages_blocks_legal_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pages_blocks_partners_parent_id_fk') THEN
        ALTER TABLE "pages_blocks_partners" ADD CONSTRAINT "pages_blocks_partners_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pages_blocks_partners_items_logo_id_media_id_fk') THEN
        ALTER TABLE "pages_blocks_partners_items" ADD CONSTRAINT "pages_blocks_partners_items_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pages_blocks_partners_items_parent_id_fk') THEN
        ALTER TABLE "pages_blocks_partners_items" ADD CONSTRAINT "pages_blocks_partners_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_partners"("id") ON DELETE cascade ON UPDATE no action;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pages_blocks_team_parent_id_fk') THEN
        ALTER TABLE "pages_blocks_team" ADD CONSTRAINT "pages_blocks_team_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pages_blocks_team_people_photo_id_media_id_fk') THEN
        ALTER TABLE "pages_blocks_team_people" ADD CONSTRAINT "pages_blocks_team_people_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pages_blocks_team_people_parent_id_fk') THEN
        ALTER TABLE "pages_blocks_team_people" ADD CONSTRAINT "pages_blocks_team_people_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_team"("id") ON DELETE cascade ON UPDATE no action;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pages_blocks_team_people_socials_parent_id_fk') THEN
        ALTER TABLE "pages_blocks_team_people_socials" ADD CONSTRAINT "pages_blocks_team_people_socials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_team_people"("id") ON DELETE cascade ON UPDATE no action;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pages_blocks_map_area_parent_id_fk') THEN
        ALTER TABLE "pages_blocks_map_area" ADD CONSTRAINT "pages_blocks_map_area_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pages_blocks_map_area_cities_parent_id_fk') THEN
        ALTER TABLE "pages_blocks_map_area_cities" ADD CONSTRAINT "pages_blocks_map_area_cities_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_map_area"("id") ON DELETE cascade ON UPDATE no action;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pages_blocks_offer_cards_parent_id_fk') THEN
        ALTER TABLE "pages_blocks_offer_cards" ADD CONSTRAINT "pages_blocks_offer_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pages_blocks_offer_cards_cards_parent_id_fk') THEN
        ALTER TABLE "pages_blocks_offer_cards_cards" ADD CONSTRAINT "pages_blocks_offer_cards_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_offer_cards"("id") ON DELETE cascade ON UPDATE no action;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pages_blocks_offer_cards_cards_features_parent_id_fk') THEN
        ALTER TABLE "pages_blocks_offer_cards_cards_features" ADD CONSTRAINT "pages_blocks_offer_cards_cards_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_offer_cards_cards"("id") ON DELETE cascade ON UPDATE no action;
      END IF;
    END $$;

    -- Versioned foreign keys
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_pages_v_blocks_hero_background_image_id_media_id_fk') THEN
        ALTER TABLE "_pages_v_blocks_hero" ADD CONSTRAINT "_pages_v_blocks_hero_background_image_id_media_id_fk" FOREIGN KEY ("background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_pages_v_blocks_hero_parent_id_fk') THEN
        ALTER TABLE "_pages_v_blocks_hero" ADD CONSTRAINT "_pages_v_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_pages_v_blocks_stats_parent_id_fk') THEN
        ALTER TABLE "_pages_v_blocks_stats" ADD CONSTRAINT "_pages_v_blocks_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_pages_v_blocks_stats_items_parent_id_fk') THEN
        ALTER TABLE "_pages_v_blocks_stats_items" ADD CONSTRAINT "_pages_v_blocks_stats_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_stats"("id") ON DELETE cascade ON UPDATE no action;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_pages_v_blocks_services_parent_id_fk') THEN
        ALTER TABLE "_pages_v_blocks_services" ADD CONSTRAINT "_pages_v_blocks_services_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_pages_v_blocks_services_items_parent_id_fk') THEN
        ALTER TABLE "_pages_v_blocks_services_items" ADD CONSTRAINT "_pages_v_blocks_services_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_services"("id") ON DELETE cascade ON UPDATE no action;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_pages_v_blocks_featured_products_parent_id_fk') THEN
        ALTER TABLE "_pages_v_blocks_featured_products" ADD CONSTRAINT "_pages_v_blocks_featured_products_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_pages_v_blocks_about_image_id_media_id_fk') THEN
        ALTER TABLE "_pages_v_blocks_about" ADD CONSTRAINT "_pages_v_blocks_about_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_pages_v_blocks_about_parent_id_fk') THEN
        ALTER TABLE "_pages_v_blocks_about" ADD CONSTRAINT "_pages_v_blocks_about_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_pages_v_blocks_about_highlights_parent_id_fk') THEN
        ALTER TABLE "_pages_v_blocks_about_highlights" ADD CONSTRAINT "_pages_v_blocks_about_highlights_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_about"("id") ON DELETE cascade ON UPDATE no action;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_pages_v_blocks_rich_text_parent_id_fk') THEN
        ALTER TABLE "_pages_v_blocks_rich_text" ADD CONSTRAINT "_pages_v_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_pages_v_blocks_gallery_parent_id_fk') THEN
        ALTER TABLE "_pages_v_blocks_gallery" ADD CONSTRAINT "_pages_v_blocks_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_pages_v_blocks_gallery_images_image_id_media_id_fk') THEN
        ALTER TABLE "_pages_v_blocks_gallery_images" ADD CONSTRAINT "_pages_v_blocks_gallery_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_pages_v_blocks_gallery_images_parent_id_fk') THEN
        ALTER TABLE "_pages_v_blocks_gallery_images" ADD CONSTRAINT "_pages_v_blocks_gallery_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_gallery"("id") ON DELETE cascade ON UPDATE no action;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_pages_v_blocks_gallery_full_parent_id_fk') THEN
        ALTER TABLE "_pages_v_blocks_gallery_full" ADD CONSTRAINT "_pages_v_blocks_gallery_full_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_pages_v_blocks_gallery_full_items_image_id_media_id_fk') THEN
        ALTER TABLE "_pages_v_blocks_gallery_full_items" ADD CONSTRAINT "_pages_v_blocks_gallery_full_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_pages_v_blocks_gallery_full_items_parent_id_fk') THEN
        ALTER TABLE "_pages_v_blocks_gallery_full_items" ADD CONSTRAINT "_pages_v_blocks_gallery_full_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_gallery_full"("id") ON DELETE cascade ON UPDATE no action;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_pages_v_blocks_testimonials_parent_id_fk') THEN
        ALTER TABLE "_pages_v_blocks_testimonials" ADD CONSTRAINT "_pages_v_blocks_testimonials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_pages_v_blocks_testimonials_items_parent_id_fk') THEN
        ALTER TABLE "_pages_v_blocks_testimonials_items" ADD CONSTRAINT "_pages_v_blocks_testimonials_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_testimonials"("id") ON DELETE cascade ON UPDATE no action;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_pages_v_blocks_cta_parent_id_fk') THEN
        ALTER TABLE "_pages_v_blocks_cta" ADD CONSTRAINT "_pages_v_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_pages_v_blocks_faq_parent_id_fk') THEN
        ALTER TABLE "_pages_v_blocks_faq" ADD CONSTRAINT "_pages_v_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_pages_v_blocks_faq_items_parent_id_fk') THEN
        ALTER TABLE "_pages_v_blocks_faq_items" ADD CONSTRAINT "_pages_v_blocks_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_pages_v_blocks_pricing_parent_id_fk') THEN
        ALTER TABLE "_pages_v_blocks_pricing" ADD CONSTRAINT "_pages_v_blocks_pricing_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_pages_v_blocks_pricing_packages_parent_id_fk') THEN
        ALTER TABLE "_pages_v_blocks_pricing_packages" ADD CONSTRAINT "_pages_v_blocks_pricing_packages_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_pricing"("id") ON DELETE cascade ON UPDATE no action;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_pages_v_blocks_pricing_packages_features_parent_id_fk') THEN
        ALTER TABLE "_pages_v_blocks_pricing_packages_features" ADD CONSTRAINT "_pages_v_blocks_pricing_packages_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_pricing_packages"("id") ON DELETE cascade ON UPDATE no action;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_pages_v_blocks_steps_parent_id_fk') THEN
        ALTER TABLE "_pages_v_blocks_steps" ADD CONSTRAINT "_pages_v_blocks_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_pages_v_blocks_steps_steps_parent_id_fk') THEN
        ALTER TABLE "_pages_v_blocks_steps_steps" ADD CONSTRAINT "_pages_v_blocks_steps_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_steps"("id") ON DELETE cascade ON UPDATE no action;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_pages_v_blocks_contact_form_parent_id_fk') THEN
        ALTER TABLE "_pages_v_blocks_contact_form" ADD CONSTRAINT "_pages_v_blocks_contact_form_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_pages_v_blocks_legal_text_parent_id_fk') THEN
        ALTER TABLE "_pages_v_blocks_legal_text" ADD CONSTRAINT "_pages_v_blocks_legal_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_pages_v_blocks_partners_parent_id_fk') THEN
        ALTER TABLE "_pages_v_blocks_partners" ADD CONSTRAINT "_pages_v_blocks_partners_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_pages_v_blocks_partners_items_logo_id_media_id_fk') THEN
        ALTER TABLE "_pages_v_blocks_partners_items" ADD CONSTRAINT "_pages_v_blocks_partners_items_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_pages_v_blocks_partners_items_parent_id_fk') THEN
        ALTER TABLE "_pages_v_blocks_partners_items" ADD CONSTRAINT "_pages_v_blocks_partners_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_partners"("id") ON DELETE cascade ON UPDATE no action;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_pages_v_blocks_team_parent_id_fk') THEN
        ALTER TABLE "_pages_v_blocks_team" ADD CONSTRAINT "_pages_v_blocks_team_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_pages_v_blocks_team_people_photo_id_media_id_fk') THEN
        ALTER TABLE "_pages_v_blocks_team_people" ADD CONSTRAINT "_pages_v_blocks_team_people_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_pages_v_blocks_team_people_parent_id_fk') THEN
        ALTER TABLE "_pages_v_blocks_team_people" ADD CONSTRAINT "_pages_v_blocks_team_people_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_team"("id") ON DELETE cascade ON UPDATE no action;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_pages_v_blocks_team_people_socials_parent_id_fk') THEN
        ALTER TABLE "_pages_v_blocks_team_people_socials" ADD CONSTRAINT "_pages_v_blocks_team_people_socials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_team_people"("id") ON DELETE cascade ON UPDATE no action;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_pages_v_blocks_map_area_parent_id_fk') THEN
        ALTER TABLE "_pages_v_blocks_map_area" ADD CONSTRAINT "_pages_v_blocks_map_area_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_pages_v_blocks_map_area_cities_parent_id_fk') THEN
        ALTER TABLE "_pages_v_blocks_map_area_cities" ADD CONSTRAINT "_pages_v_blocks_map_area_cities_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_map_area"("id") ON DELETE cascade ON UPDATE no action;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_pages_v_blocks_offer_cards_parent_id_fk') THEN
        ALTER TABLE "_pages_v_blocks_offer_cards" ADD CONSTRAINT "_pages_v_blocks_offer_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_pages_v_blocks_offer_cards_cards_parent_id_fk') THEN
        ALTER TABLE "_pages_v_blocks_offer_cards_cards" ADD CONSTRAINT "_pages_v_blocks_offer_cards_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_offer_cards"("id") ON DELETE cascade ON UPDATE no action;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_pages_v_blocks_offer_cards_cards_features_parent_id_fk') THEN
        ALTER TABLE "_pages_v_blocks_offer_cards_cards_features" ADD CONSTRAINT "_pages_v_blocks_offer_cards_cards_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_offer_cards_cards"("id") ON DELETE cascade ON UPDATE no action;
      END IF;
    END $$;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // Down migration is intentionally a no-op – this is a repair migration.
  // Rolling back would mean deleting all block tables, which is destructive.
  // The tables created here are expected by the application schema.
  void db
}
