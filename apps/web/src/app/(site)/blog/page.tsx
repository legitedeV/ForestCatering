import Link from 'next/link'
import { getPayload } from '@/lib/payload-client'
import { AnimatedSection, AnimatedItem } from '@/components/ui/AnimatedSection'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface Post {
  id: string
  title: string
  slug: string
  excerpt?: string
  publishedAt?: string
}

function formatPolishDate(dateStr: string): string {
  const months = ['stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca', 'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia']
  const d = new Date(dateStr)
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
}

export default async function BlogPage() {
  let posts: Post[] = []

  try {
    const payload = await getPayload()
    const result = await payload.find({
      collection: 'posts',
      where: {
        status: { equals: 'published' },
        publishedAt: { less_than_equal: new Date().toISOString() },
      },
      sort: '-publishedAt',
      limit: 20,
    })
    posts = result.docs as unknown as Post[]
  } catch {
    // Payload not available during build
  }

  return (
    <div className="min-h-screen bg-forest-900 pt-24 pb-20">
      <div className="mx-auto max-w-5xl px-4">
        <AnimatedSection>
          <h1 className="text-3xl font-bold text-cream md:text-5xl">Blog</h1>
          <div className="mt-2 h-1 w-16 rounded bg-accent" />
          <p className="mt-4 text-lg text-forest-200">Porady, inspiracje i nowości ze świata cateringu</p>
        </AnimatedSection>

        {posts.length > 0 ? (
          <AnimatedSection stagger>
            <div className="mt-12 grid gap-8 md:grid-cols-2">
              {posts.map((post) => (
                <AnimatedItem key={post.id}>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="group flex h-full flex-col overflow-hidden rounded-xl border border-forest-700 bg-forest-800 transition hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-lg"
                  >
                    <div className="relative aspect-[16/9] bg-gradient-to-br from-forest-700 to-forest-800">
                      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-forest-800 to-transparent" />
                      <div className="flex h-full items-center justify-center text-4xl">📝</div>
                    </div>
                    <div className="flex flex-1 flex-col p-6">
                      <h2 className="text-xl font-semibold text-cream transition group-hover:text-accent">
                        {post.title}
                      </h2>
                      {post.excerpt && (
                        <p className="mt-2 text-sm text-forest-300 line-clamp-3">{post.excerpt}</p>
                      )}
                      <div className="mt-auto pt-4 flex items-center justify-between">
                        {post.publishedAt && (
                          <span className="text-xs text-forest-400">{formatPolishDate(post.publishedAt)}</span>
                        )}
                        <span className="text-sm font-medium text-accent">Czytaj więcej →</span>
                      </div>
                    </div>
                  </Link>
                </AnimatedItem>
              ))}
            </div>
          </AnimatedSection>
        ) : (
          <div className="mt-20 text-center">
            <span className="text-5xl">📝</span>
            <p className="mt-4 text-lg text-forest-200">Brak wpisów — wróć wkrótce!</p>
          </div>
        )}
      </div>
    </div>
  )
}
