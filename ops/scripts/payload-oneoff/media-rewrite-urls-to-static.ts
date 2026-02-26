import payload from 'payload'
import config from '../../payload.config'

function toStaticURL(filename: string) {
  return `/media/${filename}`
}

async function main() {
  await payload.init({ config, local: true })

  const res = await payload.find({
    collection: 'media',
    where: {
      filename: { like: 'produkt_%' },
    },
    limit: 1000,
  })

  let updated = 0

  for (const doc of res.docs) {
    const next: any = {}

    if (doc.filename) next.url = toStaticURL(doc.filename)

    if (doc.sizes) {
      next.sizes = { ...doc.sizes }
      for (const key of Object.keys(doc.sizes)) {
        const size = (doc.sizes as any)[key]
        if (size?.filename) {
          next.sizes[key] = {
            ...size,
            url: toStaticURL(size.filename),
          }
        }
      }
    }

    await payload.update({
      collection: 'media',
      id: doc.id,
      data: next,
    })

    updated++
    console.log(`rewrote: ${doc.filename}`)
  }

  console.log(`DONE ✅ updated=${updated}`)
  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
