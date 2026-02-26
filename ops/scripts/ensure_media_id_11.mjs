import fs from 'fs'
import path from 'path'
import { Client } from 'pg'

function loadDotEnv(file) {
  try {
    const txt = fs.readFileSync(file, 'utf8')
    for (const line of txt.split('\n')) {
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/)
      if (!m) continue
      const k = m[1]
      let v = m[2] ?? ''
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1)
      if (!process.env[k]) process.env[k] = v
    }
  } catch {}
}

const root = '/home/forest/ForestCatering'
loadDotEnv(path.join(root, '.env'))
loadDotEnv(path.join(root, 'apps/web/.env'))
loadDotEnv(path.join(root, 'apps/web/.env.local'))

const conn =
  process.env.DATABASE_URI ||
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL

if (!conn) {
  console.error('❌ Missing DATABASE_URI / DATABASE_URL / POSTGRES_URL (not in env/.env)')
  process.exit(1)
}

// wybierz dowolny istniejący jpg jako placeholder
const candidates = [
  path.join(root, 'apps/web/public/media/brownie-bites.jpg'),
  path.join(root, 'public/media/brownie-bites.jpg'),
  path.join(root, 'apps/web/public/media/produkt_1.jpg'),
  path.join(root, 'public/media/produkt_1.jpg'),
]
const filePath = candidates.find(p => fs.existsSync(p))
if (!filePath) {
  console.error('❌ Could not find a placeholder jpg in public/media (brownie-bites.jpg / produkt_1.jpg)')
  process.exit(1)
}
const filename = path.basename(filePath)
const stat = fs.statSync(filePath)

const client = new Client({ connectionString: conn })
await client.connect()

const exists = await client.query('select id from media where id = 11')
if (exists.rows.length) {
  console.log('✅ media id=11 already exists')
  await client.end()
  process.exit(0)
}

const colsRes = await client.query(`
  select column_name
  from information_schema.columns
  where table_schema='public' and table_name='media'
  order by ordinal_position
`)
const cols = colsRes.rows.map(r => r.column_name)
const has = (c) => cols.includes(c)

const values = []
const columns = []
const placeholders = []

function add(col, val) {
  if (!has(col)) return
  columns.push(`"${col}"`)
  values.push(val)
  placeholders.push(`$${values.length}`)
}

// minimalny zestaw + bezpieczne opcjonalne
add('id', 11)
add('filename', filename)
add('alt', 'seed hero bg')
add('mime_type', 'image/jpeg')
add('mimeType', 'image/jpeg')
add('filesize', stat.size)
add('file_size', stat.size)
add('fileSize', stat.size)
add('width', 1920)
add('height', 1080)
add('focal_x', 50)
add('focalX', 50)
add('focal_y', 50)
add('focalY', 50)
add('sizes', JSON.stringify({}))

// timestamps (różne nazwy w zależności od schematu)
if (has('created_at')) { columns.push('"created_at"'); placeholders.push('now()') }
if (has('updated_at')) { columns.push('"updated_at"'); placeholders.push('now()') }
if (has('createdAt'))  { columns.push('"createdAt"');  placeholders.push('now()') }
if (has('updatedAt'))  { columns.push('"updatedAt"');  placeholders.push('now()') }

if (!columns.includes('"id"') || !columns.includes('"filename"')) {
  console.error('❌ Could not detect required columns id/filename. Columns:', cols)
  process.exit(1)
}

const sql = `insert into media (${columns.join(', ')}) values (${placeholders.join(', ')})`
await client.query(sql, values)

// bump sequence jeśli jest
try {
  await client.query(`select setval(pg_get_serial_sequence('media','id'), (select max(id) from media))`)
} catch {}

console.log(`✅ inserted media id=11 with filename=${filename}`)
await client.end()
