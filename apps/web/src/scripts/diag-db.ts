import { Client } from 'pg'

const DATABASE_URI = process.env.DATABASE_URI || process.env.DATABASE_URL

if (!DATABASE_URI) {
  console.error('❌ Missing DATABASE_URI/DATABASE_URL env variable.')
  process.exit(1)
}

async function tableExists(client: Client, tableName: string): Promise<boolean> {
  const result = await client.query<{ exists: boolean }>(
    `SELECT EXISTS (
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = current_schema()
      AND table_name = $1
    ) AS exists`,
    [tableName],
  )

  return result.rows[0]?.exists ?? false
}

async function columnExists(client: Client, tableName: string, columnName: string): Promise<boolean> {
  const result = await client.query<{ exists: boolean }>(
    `SELECT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = current_schema()
      AND table_name = $1
      AND column_name = $2
    ) AS exists`,
    [tableName, columnName],
  )

  return result.rows[0]?.exists ?? false
}

async function run() {
  const client = new Client({ connectionString: DATABASE_URI })
  await client.connect()

  try {
    const schemaResult = await client.query<{ current_schema: string }>('select current_schema()')
    const searchPathResult = await client.query<{ search_path: string }>('show search_path')

    console.log('ℹ️ current_schema():', schemaResult.rows[0]?.current_schema)
    console.log('ℹ️ search_path:', searchPathResult.rows[0]?.search_path)

    const requiredTables = [
      'users',
      'pages',
      'payload_migrations',
      'payload_locked_documents',
      'payload_locked_documents_rels',
      'payload_preferences',
      'payload_preferences_rels',
      'pages_blocks_stats',
      'pages_blocks_stats_items',
      'pages_blocks_services',
      'pages_blocks_services_items',
      'pages_blocks_featured_products',
      'pages_blocks_about',
      'pages_blocks_about_highlights',
      'pages_blocks_testimonials',
      'pages_blocks_testimonials_items',
      'pages_blocks_pricing',
      'pages_blocks_pricing_packages',
      'pages_blocks_pricing_packages_features',
      'pages_blocks_steps',
      'pages_blocks_steps_steps',
      'pages_blocks_contact_form',
      'pages_blocks_legal_text',
      'pages_blocks_gallery_full',
      'pages_blocks_gallery_full_items',
    ]

    let hasErrors = false

    for (const table of requiredTables) {
      const exists = await tableExists(client, table)
      console.log(`ℹ️ table ${table}:`, exists ? 'exists' : 'missing')
      if (!exists) hasErrors = true
    }

    const requiredColumns: Array<[string, string]> = [
      ['pages', 'path'],
      ['pages', 'parent_id'],
      ['pages', 'sort_order'],
      ['payload_locked_documents_rels', 'path'],
      ['payload_preferences_rels', 'path'],
    ]

    for (const [table, column] of requiredColumns) {
      const exists = await columnExists(client, table, column)
      console.log(`ℹ️ ${table}.${column}:`, exists ? 'exists' : 'missing')
      if (!exists) hasErrors = true
    }

    if (hasErrors) {
      console.error('❌ DB schema diagnostics failed. Run Payload migrations and verify DATABASE_URI or DATABASE_URL/search_path.')
      process.exit(1)
    }

    console.log('✅ DB schema diagnostics passed.')
  } finally {
    await client.end()
  }
}

run().catch((error) => {
  console.error('❌ DB diagnostics failed:', error)
  process.exit(1)
})
