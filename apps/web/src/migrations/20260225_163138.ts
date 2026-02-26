import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_partners_variant" AS ENUM('grid', 'carousel');
  CREATE TYPE "public"."enum__pages_v_blocks_partners_variant" AS ENUM('grid', 'carousel');
  CREATE TABLE "pages_blocks_partners_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"logo_id" integer,
  	"name" varchar,
  	"url" varchar
  );
  
  CREATE TABLE "pages_blocks_partners" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"variant" "enum_pages_blocks_partners_variant" DEFAULT 'grid',
  	"grayscale" boolean DEFAULT true,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_team_people_socials" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"url" varchar
  );
  
  CREATE TABLE "pages_blocks_team_people" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"photo_id" integer,
  	"name" varchar,
  	"role" varchar,
  	"bio" varchar
  );
  
  CREATE TABLE "pages_blocks_team" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_map_area_cities" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar
  );
  
  CREATE TABLE "pages_blocks_map_area" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"description" varchar,
  	"embed_url" varchar,
  	"note" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_offer_cards_cards_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "pages_blocks_offer_cards_cards" (
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
  
  CREATE TABLE "pages_blocks_offer_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_partners_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"logo_id" integer,
  	"name" varchar,
  	"url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_partners" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"variant" "enum__pages_v_blocks_partners_variant" DEFAULT 'grid',
  	"grayscale" boolean DEFAULT true,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_team_people_socials" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_team_people" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"photo_id" integer,
  	"name" varchar,
  	"role" varchar,
  	"bio" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_team" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_map_area_cities" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_map_area" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"description" varchar,
  	"embed_url" varchar,
  	"note" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_offer_cards_cards_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_offer_cards_cards" (
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
  
  CREATE TABLE "_pages_v_blocks_offer_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "pages_blocks_partners_items" ADD CONSTRAINT "pages_blocks_partners_items_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_partners_items" ADD CONSTRAINT "pages_blocks_partners_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_partners"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_partners" ADD CONSTRAINT "pages_blocks_partners_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_team_people_socials" ADD CONSTRAINT "pages_blocks_team_people_socials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_team_people"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_team_people" ADD CONSTRAINT "pages_blocks_team_people_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_team_people" ADD CONSTRAINT "pages_blocks_team_people_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_team"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_team" ADD CONSTRAINT "pages_blocks_team_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_map_area_cities" ADD CONSTRAINT "pages_blocks_map_area_cities_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_map_area"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_map_area" ADD CONSTRAINT "pages_blocks_map_area_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_offer_cards_cards_features" ADD CONSTRAINT "pages_blocks_offer_cards_cards_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_offer_cards_cards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_offer_cards_cards" ADD CONSTRAINT "pages_blocks_offer_cards_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_offer_cards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_offer_cards" ADD CONSTRAINT "pages_blocks_offer_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_partners_items" ADD CONSTRAINT "_pages_v_blocks_partners_items_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_partners_items" ADD CONSTRAINT "_pages_v_blocks_partners_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_partners"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_partners" ADD CONSTRAINT "_pages_v_blocks_partners_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_team_people_socials" ADD CONSTRAINT "_pages_v_blocks_team_people_socials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_team_people"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_team_people" ADD CONSTRAINT "_pages_v_blocks_team_people_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_team_people" ADD CONSTRAINT "_pages_v_blocks_team_people_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_team"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_team" ADD CONSTRAINT "_pages_v_blocks_team_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_map_area_cities" ADD CONSTRAINT "_pages_v_blocks_map_area_cities_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_map_area"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_map_area" ADD CONSTRAINT "_pages_v_blocks_map_area_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_offer_cards_cards_features" ADD CONSTRAINT "_pages_v_blocks_offer_cards_cards_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_offer_cards_cards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_offer_cards_cards" ADD CONSTRAINT "_pages_v_blocks_offer_cards_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_offer_cards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_offer_cards" ADD CONSTRAINT "_pages_v_blocks_offer_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_partners_items_order_idx" ON "pages_blocks_partners_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_partners_items_parent_id_idx" ON "pages_blocks_partners_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_partners_items_logo_idx" ON "pages_blocks_partners_items" USING btree ("logo_id");
  CREATE INDEX "pages_blocks_partners_order_idx" ON "pages_blocks_partners" USING btree ("_order");
  CREATE INDEX "pages_blocks_partners_parent_id_idx" ON "pages_blocks_partners" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_partners_path_idx" ON "pages_blocks_partners" USING btree ("_path");
  CREATE INDEX "pages_blocks_team_people_socials_order_idx" ON "pages_blocks_team_people_socials" USING btree ("_order");
  CREATE INDEX "pages_blocks_team_people_socials_parent_id_idx" ON "pages_blocks_team_people_socials" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_team_people_order_idx" ON "pages_blocks_team_people" USING btree ("_order");
  CREATE INDEX "pages_blocks_team_people_parent_id_idx" ON "pages_blocks_team_people" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_team_people_photo_idx" ON "pages_blocks_team_people" USING btree ("photo_id");
  CREATE INDEX "pages_blocks_team_order_idx" ON "pages_blocks_team" USING btree ("_order");
  CREATE INDEX "pages_blocks_team_parent_id_idx" ON "pages_blocks_team" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_team_path_idx" ON "pages_blocks_team" USING btree ("_path");
  CREATE INDEX "pages_blocks_map_area_cities_order_idx" ON "pages_blocks_map_area_cities" USING btree ("_order");
  CREATE INDEX "pages_blocks_map_area_cities_parent_id_idx" ON "pages_blocks_map_area_cities" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_map_area_order_idx" ON "pages_blocks_map_area" USING btree ("_order");
  CREATE INDEX "pages_blocks_map_area_parent_id_idx" ON "pages_blocks_map_area" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_map_area_path_idx" ON "pages_blocks_map_area" USING btree ("_path");
  CREATE INDEX "pages_blocks_offer_cards_cards_features_order_idx" ON "pages_blocks_offer_cards_cards_features" USING btree ("_order");
  CREATE INDEX "pages_blocks_offer_cards_cards_features_parent_id_idx" ON "pages_blocks_offer_cards_cards_features" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_offer_cards_cards_order_idx" ON "pages_blocks_offer_cards_cards" USING btree ("_order");
  CREATE INDEX "pages_blocks_offer_cards_cards_parent_id_idx" ON "pages_blocks_offer_cards_cards" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_offer_cards_order_idx" ON "pages_blocks_offer_cards" USING btree ("_order");
  CREATE INDEX "pages_blocks_offer_cards_parent_id_idx" ON "pages_blocks_offer_cards" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_offer_cards_path_idx" ON "pages_blocks_offer_cards" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_partners_items_order_idx" ON "_pages_v_blocks_partners_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_partners_items_parent_id_idx" ON "_pages_v_blocks_partners_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_partners_items_logo_idx" ON "_pages_v_blocks_partners_items" USING btree ("logo_id");
  CREATE INDEX "_pages_v_blocks_partners_order_idx" ON "_pages_v_blocks_partners" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_partners_parent_id_idx" ON "_pages_v_blocks_partners" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_partners_path_idx" ON "_pages_v_blocks_partners" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_team_people_socials_order_idx" ON "_pages_v_blocks_team_people_socials" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_team_people_socials_parent_id_idx" ON "_pages_v_blocks_team_people_socials" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_team_people_order_idx" ON "_pages_v_blocks_team_people" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_team_people_parent_id_idx" ON "_pages_v_blocks_team_people" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_team_people_photo_idx" ON "_pages_v_blocks_team_people" USING btree ("photo_id");
  CREATE INDEX "_pages_v_blocks_team_order_idx" ON "_pages_v_blocks_team" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_team_parent_id_idx" ON "_pages_v_blocks_team" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_team_path_idx" ON "_pages_v_blocks_team" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_map_area_cities_order_idx" ON "_pages_v_blocks_map_area_cities" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_map_area_cities_parent_id_idx" ON "_pages_v_blocks_map_area_cities" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_map_area_order_idx" ON "_pages_v_blocks_map_area" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_map_area_parent_id_idx" ON "_pages_v_blocks_map_area" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_map_area_path_idx" ON "_pages_v_blocks_map_area" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_offer_cards_cards_features_order_idx" ON "_pages_v_blocks_offer_cards_cards_features" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_offer_cards_cards_features_parent_id_idx" ON "_pages_v_blocks_offer_cards_cards_features" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_offer_cards_cards_order_idx" ON "_pages_v_blocks_offer_cards_cards" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_offer_cards_cards_parent_id_idx" ON "_pages_v_blocks_offer_cards_cards" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_offer_cards_order_idx" ON "_pages_v_blocks_offer_cards" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_offer_cards_parent_id_idx" ON "_pages_v_blocks_offer_cards" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_offer_cards_path_idx" ON "_pages_v_blocks_offer_cards" USING btree ("_path");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_partners_items" CASCADE;
  DROP TABLE "pages_blocks_partners" CASCADE;
  DROP TABLE "pages_blocks_team_people_socials" CASCADE;
  DROP TABLE "pages_blocks_team_people" CASCADE;
  DROP TABLE "pages_blocks_team" CASCADE;
  DROP TABLE "pages_blocks_map_area_cities" CASCADE;
  DROP TABLE "pages_blocks_map_area" CASCADE;
  DROP TABLE "pages_blocks_offer_cards_cards_features" CASCADE;
  DROP TABLE "pages_blocks_offer_cards_cards" CASCADE;
  DROP TABLE "pages_blocks_offer_cards" CASCADE;
  DROP TABLE "_pages_v_blocks_partners_items" CASCADE;
  DROP TABLE "_pages_v_blocks_partners" CASCADE;
  DROP TABLE "_pages_v_blocks_team_people_socials" CASCADE;
  DROP TABLE "_pages_v_blocks_team_people" CASCADE;
  DROP TABLE "_pages_v_blocks_team" CASCADE;
  DROP TABLE "_pages_v_blocks_map_area_cities" CASCADE;
  DROP TABLE "_pages_v_blocks_map_area" CASCADE;
  DROP TABLE "_pages_v_blocks_offer_cards_cards_features" CASCADE;
  DROP TABLE "_pages_v_blocks_offer_cards_cards" CASCADE;
  DROP TABLE "_pages_v_blocks_offer_cards" CASCADE;
  DROP TYPE "public"."enum_pages_blocks_partners_variant";
  DROP TYPE "public"."enum__pages_v_blocks_partners_variant";`)
}
