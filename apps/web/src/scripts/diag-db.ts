import { Client } from 'pg'

const DATABASE_URI = process.env.DATABASE_URI

if (!DATABASE_URI) {
  console.error('❌ Missing DATABASE_URI env variable.')
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

    for (const table of ['users', 'pages', 'payload_migrations']) {
      console.log(`ℹ️ table ${table}:`, (await tableExists(client, table)) ? 'exists' : 'missing')
    }

    for (const column of ['path', 'parent_id', 'sort_order']) {
      console.log(`ℹ️ pages.${column}:`, (await columnExists(client, 'pages', column)) ? 'exists' : 'missing')
    }
  } finally {
    await client.end()
  }
}

run().catch((error) => {
  console.error('❌ DB diagnostics failed:', error)
  process.exit(1)
})
