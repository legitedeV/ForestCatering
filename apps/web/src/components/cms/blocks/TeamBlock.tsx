import Image from 'next/image'
import Link from 'next/link'
import type { PageSection } from '../types'
import { AnimatedItem, AnimatedSection } from '@/components/ui/AnimatedSection'
import { getMediaUrl } from '@/lib/media'

type TeamProps = Extract<PageSection, { blockType: 'team' }>

export function TeamBlock({ heading, people }: TeamProps) {
  if (!people?.length) return null

  return (
    <section className="bg-forest-950 py-20">
      <div className="mx-auto max-w-7xl px-4">
        {heading && (
          <AnimatedSection>
            <h2 className="text-center text-3xl font-bold text-cream md:text-5xl">{heading}</h2>
          </AnimatedSection>
        )}

        <AnimatedSection stagger>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {people.map((person, index) => {
              const photoUrl = getMediaUrl(person.photo)

              return (
                <AnimatedItem key={person.id ?? index}>
                  <article className="overflow-hidden rounded-2xl border border-forest-700 bg-forest-900">
                    <div className="relative aspect-[4/5] bg-forest-800">
                      {photoUrl && <Image src={photoUrl} alt={person.name} fill className="object-cover" />}
                    </div>
                    <div className="space-y-3 p-6">
                      <h3 className="text-xl font-semibold text-cream">{person.name}</h3>
                      <p className="text-sm text-accent">{person.role}</p>
                      {person.bio && <p className="text-sm leading-relaxed text-forest-200">{person.bio}</p>}
                      {!!person.socials?.length && (
                        <div className="flex flex-wrap gap-3 pt-1">
                          {person.socials.map((social, socialIndex) => (
                            <Link
                              key={social.id ?? socialIndex}
                              href={social.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-forest-300 underline-offset-2 transition hover:text-accent hover:underline"
                            >
                              {social.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  </article>
                </AnimatedItem>
              )
            })}
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}
