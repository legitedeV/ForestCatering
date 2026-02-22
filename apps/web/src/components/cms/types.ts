import type { Page } from '@/payload-types'

export type PageSection = NonNullable<Page['sections']>[number]
