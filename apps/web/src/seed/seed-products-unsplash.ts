// Seed produktów Unsplash – tymczasowo wyłączony.
//
// Obecnie produkty korzystają z lokalnych obrazów w public/media/*.
// Ten plik zostaje jako no-op, żeby TypeScript/Next miały czysty build
// i żeby npm run unsplash nie rozwalał deploya.

;(async () => {
  console.log('✅ Seed produktów Unsplash jest wyłączony – używane są lokalne zdjęcia z public/media.')
})().catch((err) => {
  console.error('Seed produktów Unsplash (no-op) zgłosił błąd:', err)
  process.exit(1)
})
