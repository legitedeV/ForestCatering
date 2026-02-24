import * as migration_20260219_230653 from './20260219_230653'
import * as migration_20260224_000001_add_pages_tree_fields from './20260224_000001_add_pages_tree_fields'

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
]
