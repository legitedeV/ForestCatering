import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getPayload } from '@/lib/payload-client'
import { AnimatedSection } from '@/components/ui/AnimatedSection'
import { ShareButton } from '@/components/ui/ShareButton'
import type { SerializedEditorState } from 'lexical'
import { RichText } from '@payloadcms/richtext-lexical/react'

interface Post {
  id: string
  title: string
  slug: string
  excerpt?: string
  content?: SerializedEditorState
  publishedAt?: string
}

function formatPolishDate(dateStr: string): string {
  const months = ['stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca', 'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia']
  const d = new Date(dateStr)
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
}

interface Props {
  params: Promise<{ slug: string }>
}

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params

  let post: Post | null = null
  try {
    const payload = await getPayload()
    const result = await payload.find({
      collection: 'posts',
      where: {
        slug: { equals: slug },
        status: { equals: 'published' },
      },
      limit: 1,
    })
    post = (result.docs[0] as unknown as Post) || null
  } catch {
    // Payload not available during build
  }

  if (!post) notFound()

  // Estimate reading time
  const wordCount = JSON.stringify(post.content || '').split(/\s+/).length
  const readingTime = Math.max(1, Math.ceil(wordCount / 200))

  return (
    <div className="min-h-screen bg-forest-900 pt-24 pb-20">
      {/* Cover */}
      <div className="relative h-64 bg-gradient-to-br from-forest-800 to-forest-900 md:h-96">
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-forest-900 to-transparent" />
        <div className="flex h-full items-center justify-center text-6xl">📝</div>
      </div>

      <div className="mx-auto max-w-3xl px-4">
        <AnimatedSection>
          <h1 className="mt-8 text-3xl font-bold text-cream md:text-4xl">{post.title}</h1>
          <div className="mt-4 flex items-center gap-4 text-sm text-forest-400">
            {post.publishedAt && <span>{formatPolishDate(post.publishedAt)}</span>}
            <span>·</span>
            <span>{readingTime} min czytania</span>
          </div>
        </AnimatedSection>

        {/* Content */}
        <AnimatedSection>
          <div className="prose prose-invert prose-lg mt-10 max-w-none prose-headings:text-cream prose-p:text-forest-100 prose-a:text-accent prose-strong:text-cream">
            {post.excerpt && <p className="lead text-forest-200">{post.excerpt}</p>}
            {post.content ? (
              <RichText data={post.content} />
            ) : (
              <p className="text-forest-200">Pełna treść tego artykułu jest dostępna po dodaniu treści w panelu administracyjnym.</p>
            )}
          </div>
        </AnimatedSection>

        {/* Share + back */}
        <div className="mt-12 flex items-center justify-between border-t border-forest-700 pt-8">
          <Link href="/blog" className="text-sm text-forest-300 transition hover:text-accent">
            ← Powrót do bloga
          </Link>
          <ShareButton />
        </div>
      </div>
    </div>
  )
}
