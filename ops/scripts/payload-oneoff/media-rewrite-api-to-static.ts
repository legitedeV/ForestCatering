import payload from 'payload'
import config from '../../payload.config'

function rewrite(u: string | null | undefined) {
  if (!u) return u
  return u.replace('/api/media/file/', '/media/')
}

async function main() {
  await payload.init({ config, local: true })

  const res = await payload.find({
    collection: 'media',
    where: { filename: { like: 'produkt_%' } },
    limit: 1000,
  })

  let updated = 0

  for (const doc of res.docs) {
    const next: any = {}

    const newUrl = rewrite(doc.url)
    if (newUrl && newUrl !== doc.url) next.url = newUrl

    const newThumbUrl = rewrite(doc.thumbnailURL)
    if (newThumbUrl && newThumbUrl !== doc.thumbnailURL) next.thumbnailURL = newThumbUrl

    if (doc.sizes) {
      const sizesNext: any = { ...doc.sizes }
      let changed = false

      for (const key of Object.keys(doc.sizes)) {
        const s: any = (doc.sizes as any)[key]
        if (!s) continue
        const newSizeUrl = rewrite(s.url)
        if (newSizeUrl !== s.url) {
          sizesNext[key] = { ...s, url: newSizeUrl }
          changed = true
        }
      }

      if (changed) next.sizes = sizesNext
    }

    if (Object.keys(next).length) {
      await payload.update({
        collection: 'media',
        id: doc.id,
        data: next,
      })
      updated++
      console.log(`rewrote: ${doc.filename}`)
    } else {
      console.log(`skip (no change): ${doc.filename}`)
    }
  }

  console.log(`DONE ✅ updated=${updated}`)
  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
