import path from 'path'
import fs from 'fs'
import payload from 'payload'
import config from '../../payload.config'

const MEDIA_DIR = path.resolve(process.cwd(), 'public/media')
const COLLECTION = 'media'

// Importuj tylko nasze nowe pliki:
const ONLY = /^produkt_\d+\.jpg$/i

function guessMime(filename: string) {
  const f = filename.toLowerCase()
  if (f.endsWith('.png')) return 'image/png'
  if (f.endsWith('.webp')) return 'image/webp'
  if (f.endsWith('.gif')) return 'image/gif'
  if (f.endsWith('.avif')) return 'image/avif'
  return 'image/jpeg'
}

async function main() {
  await payload.init({ config, local: true })

  const files = fs
    .readdirSync(MEDIA_DIR)
    .filter((f) => ONLY.test(f))

  console.log(`MEDIA_DIR: ${MEDIA_DIR}`)
  console.log(`Found ${files.length} files to import`)

  for (const filename of files) {
    const filePath = path.join(MEDIA_DIR, filename)

    const existing = await payload.find({
      collection: COLLECTION,
      where: { filename: { equals: filename } },
      limit: 1,
    })

    if (existing.docs.length) {
      console.log(`skip (exists): ${filename}`)
      continue
    }

    const buf = fs.readFileSync(filePath)
    const created = await payload.create({
      collection: COLLECTION,
      data: { alt: filename },
      file: {
        data: buf, // ✅ Buffer (Uint8Array)
        mimetype: guessMime(filename),
        name: filename,
        size: buf.byteLength,
      },
    } as any)

    console.log(`imported: ${created.filename}`)
  }

  console.log('DONE ✅')
  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
