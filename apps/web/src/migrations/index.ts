import * as migration_20260219_230653 from './20260219_230653';
import * as migration_20260224_000001_add_pages_tree_fields from './20260224_000001_add_pages_tree_fields';
import * as migration_20260224_075113 from './20260224_075113';
import * as migration_20260224_080000_add_missing_pages_block_tables from './20260224_080000_add_missing_pages_block_tables';
import * as migration_20260225_150925 from './20260225_150925';
import * as migration_20260225_163138 from './20260225_163138';
import * as migration_20260226_000001_add_media_image_slug from './20260226_000001_add_media_image_slug';
import * as migration_20260227_000001_add_payment_integration_fields from './20260227_000001_add_payment_integration_fields';
import * as migration_20260301_121555 from './20260301_121555';
import * as migration_20260301_200000 from './20260301_200000';

export const migrations = [
  {
    up: migration_20260219_230653.up,
    down: migration_20260219_230653.down,
    name: '20260219_230653',
  },
  {
    up: migration_20260224_000001_add_pages_tree_fields.up,
    down: migration_20260224_000001_add_pages_tree_fields.down,
    name: '20260224_000001_add_pages_tree_fields',
  },
  {
    up: migration_20260224_075113.up,
    down: migration_20260224_075113.down,
    name: '20260224_075113',
  },
  {
    up: migration_20260224_080000_add_missing_pages_block_tables.up,
    down: migration_20260224_080000_add_missing_pages_block_tables.down,
    name: '20260224_080000_add_missing_pages_block_tables',
  },
  {
    up: migration_20260225_150925.up,
    down: migration_20260225_150925.down,
    name: '20260225_150925',
  },
  {
    up: migration_20260225_163138.up,
    down: migration_20260225_163138.down,
    name: '20260225_163138',
  },
  {
    up: migration_20260226_000001_add_media_image_slug.up,
    down: migration_20260226_000001_add_media_image_slug.down,
    name: '20260226_000001_add_media_image_slug',
  },
  {
    up: migration_20260227_000001_add_payment_integration_fields.up,
    down: migration_20260227_000001_add_payment_integration_fields.down,
    name: '20260227_000001_add_payment_integration_fields',
  },
  {
    up: migration_20260301_121555.up,
    down: migration_20260301_121555.down,
    name: '20260301_121555'
  },
  {
    up: migration_20260301_200000.up,
    down: migration_20260301_200000.down,
    name: '20260301_200000',
  },
];
