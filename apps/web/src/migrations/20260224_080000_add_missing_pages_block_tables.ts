import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "pages_blocks_stats" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "block_name" varchar
    );

    CREATE TABLE IF NOT EXISTS "pages_blocks_stats_items" (
      "_order" integer NOT NULL,
      "_parent_id" varchar NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "value" numeric,
      "suffix" varchar,
      "label" varchar NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "pages_blocks_services" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "block_name" varchar,
      "heading" varchar
    );

    CREATE TABLE IF NOT EXISTS "pages_blocks_services_items" (
      "_order" integer NOT NULL,
      "_parent_id" varchar NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "emoji" varchar NOT NULL,
      "title" varchar NOT NULL,
      "description" varchar NOT NULL,
      "link" varchar
    );

    CREATE TABLE IF NOT EXISTS "pages_blocks_featured_products" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "block_name" varchar,
      "heading" varchar,
      "limit" numeric DEFAULT 6,
      "link_text" varchar,
      "link_url" varchar
    );

    CREATE TABLE IF NOT EXISTS "pages_blocks_about" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "block_name" varchar,
      "badge" varchar,
      "heading" varchar NOT NULL,
      "content" jsonb,
      "image_id" integer,
      "cta_text" varchar,
      "cta_link" varchar
    );

    CREATE TABLE IF NOT EXISTS "pages_blocks_about_highlights" (
      "_order" integer NOT NULL,
      "_parent_id" varchar NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "text" varchar NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "pages_blocks_testimonials" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "block_name" varchar,
      "heading" varchar
    );

    CREATE TABLE IF NOT EXISTS "pages_blocks_testimonials_items" (
      "_order" integer NOT NULL,
      "_parent_id" varchar NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "quote" varchar NOT NULL,
      "author" varchar NOT NULL,
      "event" varchar,
      "rating" numeric DEFAULT 5
    );

    CREATE TABLE IF NOT EXISTS "pages_blocks_pricing" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "block_name" varchar,
      "heading" varchar,
      "subheading" varchar
    );

    CREATE TABLE IF NOT EXISTS "pages_blocks_pricing_packages" (
      "_order" integer NOT NULL,
      "_parent_id" varchar NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "name" varchar NOT NULL,
      "price" varchar NOT NULL,
      "cta_text" varchar,
      "cta_link" varchar,
      "featured" boolean DEFAULT false
    );

    CREATE TABLE IF NOT EXISTS "pages_blocks_pricing_packages_features" (
      "_order" integer NOT NULL,
      "_parent_id" varchar NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "text" varchar NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "pages_blocks_steps" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "block_name" varchar,
      "heading" varchar
    );

    CREATE TABLE IF NOT EXISTS "pages_blocks_steps_steps" (
      "_order" integer NOT NULL,
      "_parent_id" varchar NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "emoji" varchar NOT NULL,
      "title" varchar NOT NULL,
      "description" varchar NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "pages_blocks_contact_form" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "block_name" varchar,
      "heading" varchar,
      "subheading" varchar
    );

    CREATE TABLE IF NOT EXISTS "pages_blocks_legal_text" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "block_name" varchar,
      "heading" varchar,
      "effective_date" timestamp(3) with time zone,
      "content" jsonb NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "pages_blocks_gallery_full" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "block_name" varchar,
      "heading" varchar
    );

    CREATE TABLE IF NOT EXISTS "pages_blocks_gallery_full_items" (
      "_order" integer NOT NULL,
      "_parent_id" varchar NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "image_id" integer NOT NULL,
      "alt" varchar,
      "category" varchar,
      "category_label" varchar
    );

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

    CREATE INDEX IF NOT EXISTS "pages_blocks_testimonials_order_idx" ON "pages_blocks_testimonials" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "pages_blocks_testimonials_parent_id_idx" ON "pages_blocks_testimonials" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "pages_blocks_testimonials_path_idx" ON "pages_blocks_testimonials" USING btree ("_path");
    CREATE INDEX IF NOT EXISTS "pages_blocks_testimonials_items_order_idx" ON "pages_blocks_testimonials_items" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "pages_blocks_testimonials_items_parent_id_idx" ON "pages_blocks_testimonials_items" USING btree ("_parent_id");

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

    CREATE INDEX IF NOT EXISTS "pages_blocks_gallery_full_order_idx" ON "pages_blocks_gallery_full" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "pages_blocks_gallery_full_parent_id_idx" ON "pages_blocks_gallery_full" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "pages_blocks_gallery_full_path_idx" ON "pages_blocks_gallery_full" USING btree ("_path");
    CREATE INDEX IF NOT EXISTS "pages_blocks_gallery_full_items_order_idx" ON "pages_blocks_gallery_full_items" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "pages_blocks_gallery_full_items_parent_id_idx" ON "pages_blocks_gallery_full_items" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "pages_blocks_gallery_full_items_image_idx" ON "pages_blocks_gallery_full_items" USING btree ("image_id");

    DO $$
    BEGIN
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

      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pages_blocks_about_parent_id_fk') THEN
        ALTER TABLE "pages_blocks_about" ADD CONSTRAINT "pages_blocks_about_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pages_blocks_about_image_id_media_id_fk') THEN
        ALTER TABLE "pages_blocks_about" ADD CONSTRAINT "pages_blocks_about_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pages_blocks_about_highlights_parent_id_fk') THEN
        ALTER TABLE "pages_blocks_about_highlights" ADD CONSTRAINT "pages_blocks_about_highlights_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_about"("id") ON DELETE cascade ON UPDATE no action;
      END IF;

      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pages_blocks_testimonials_parent_id_fk') THEN
        ALTER TABLE "pages_blocks_testimonials" ADD CONSTRAINT "pages_blocks_testimonials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pages_blocks_testimonials_items_parent_id_fk') THEN
        ALTER TABLE "pages_blocks_testimonials_items" ADD CONSTRAINT "pages_blocks_testimonials_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_testimonials"("id") ON DELETE cascade ON UPDATE no action;
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

      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pages_blocks_gallery_full_parent_id_fk') THEN
        ALTER TABLE "pages_blocks_gallery_full" ADD CONSTRAINT "pages_blocks_gallery_full_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pages_blocks_gallery_full_items_parent_id_fk') THEN
        ALTER TABLE "pages_blocks_gallery_full_items" ADD CONSTRAINT "pages_blocks_gallery_full_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_gallery_full"("id") ON DELETE cascade ON UPDATE no action;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pages_blocks_gallery_full_items_image_id_media_id_fk') THEN
        ALTER TABLE "pages_blocks_gallery_full_items" ADD CONSTRAINT "pages_blocks_gallery_full_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
      END IF;
    END $$;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "pages_blocks_gallery_full_items" DROP CONSTRAINT IF EXISTS "pages_blocks_gallery_full_items_image_id_media_id_fk";
    ALTER TABLE "pages_blocks_gallery_full_items" DROP CONSTRAINT IF EXISTS "pages_blocks_gallery_full_items_parent_id_fk";
    ALTER TABLE "pages_blocks_gallery_full" DROP CONSTRAINT IF EXISTS "pages_blocks_gallery_full_parent_id_fk";
    ALTER TABLE "pages_blocks_legal_text" DROP CONSTRAINT IF EXISTS "pages_blocks_legal_text_parent_id_fk";
    ALTER TABLE "pages_blocks_contact_form" DROP CONSTRAINT IF EXISTS "pages_blocks_contact_form_parent_id_fk";
    ALTER TABLE "pages_blocks_steps_steps" DROP CONSTRAINT IF EXISTS "pages_blocks_steps_steps_parent_id_fk";
    ALTER TABLE "pages_blocks_steps" DROP CONSTRAINT IF EXISTS "pages_blocks_steps_parent_id_fk";
    ALTER TABLE "pages_blocks_pricing_packages_features" DROP CONSTRAINT IF EXISTS "pages_blocks_pricing_packages_features_parent_id_fk";
    ALTER TABLE "pages_blocks_pricing_packages" DROP CONSTRAINT IF EXISTS "pages_blocks_pricing_packages_parent_id_fk";
    ALTER TABLE "pages_blocks_pricing" DROP CONSTRAINT IF EXISTS "pages_blocks_pricing_parent_id_fk";
    ALTER TABLE "pages_blocks_testimonials_items" DROP CONSTRAINT IF EXISTS "pages_blocks_testimonials_items_parent_id_fk";
    ALTER TABLE "pages_blocks_testimonials" DROP CONSTRAINT IF EXISTS "pages_blocks_testimonials_parent_id_fk";
    ALTER TABLE "pages_blocks_about_highlights" DROP CONSTRAINT IF EXISTS "pages_blocks_about_highlights_parent_id_fk";
    ALTER TABLE "pages_blocks_about" DROP CONSTRAINT IF EXISTS "pages_blocks_about_image_id_media_id_fk";
    ALTER TABLE "pages_blocks_about" DROP CONSTRAINT IF EXISTS "pages_blocks_about_parent_id_fk";
    ALTER TABLE "pages_blocks_featured_products" DROP CONSTRAINT IF EXISTS "pages_blocks_featured_products_parent_id_fk";
    ALTER TABLE "pages_blocks_services_items" DROP CONSTRAINT IF EXISTS "pages_blocks_services_items_parent_id_fk";
    ALTER TABLE "pages_blocks_services" DROP CONSTRAINT IF EXISTS "pages_blocks_services_parent_id_fk";
    ALTER TABLE "pages_blocks_stats_items" DROP CONSTRAINT IF EXISTS "pages_blocks_stats_items_parent_id_fk";
    ALTER TABLE "pages_blocks_stats" DROP CONSTRAINT IF EXISTS "pages_blocks_stats_parent_id_fk";

    DROP TABLE IF EXISTS "pages_blocks_gallery_full_items";
    DROP TABLE IF EXISTS "pages_blocks_gallery_full";
    DROP TABLE IF EXISTS "pages_blocks_legal_text";
    DROP TABLE IF EXISTS "pages_blocks_contact_form";
    DROP TABLE IF EXISTS "pages_blocks_steps_steps";
    DROP TABLE IF EXISTS "pages_blocks_steps";
    DROP TABLE IF EXISTS "pages_blocks_pricing_packages_features";
    DROP TABLE IF EXISTS "pages_blocks_pricing_packages";
    DROP TABLE IF EXISTS "pages_blocks_pricing";
    DROP TABLE IF EXISTS "pages_blocks_testimonials_items";
    DROP TABLE IF EXISTS "pages_blocks_testimonials";
    DROP TABLE IF EXISTS "pages_blocks_about_highlights";
    DROP TABLE IF EXISTS "pages_blocks_about";
    DROP TABLE IF EXISTS "pages_blocks_featured_products";
    DROP TABLE IF EXISTS "pages_blocks_services_items";
    DROP TABLE IF EXISTS "pages_blocks_services";
    DROP TABLE IF EXISTS "pages_blocks_stats_items";
    DROP TABLE IF EXISTS "pages_blocks_stats";
  `)
}
