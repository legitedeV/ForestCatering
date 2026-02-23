import type { Navigation, SiteSetting } from '@/payload-types'

export type NavLinkItem = {
  label: string
  href: string
}

export function mapHeaderLinks(navigation: Navigation | null | undefined): NavLinkItem[] {
  return (navigation?.headerItems ?? [])
    .filter((item): item is { label: string; url: string } => Boolean(item?.label && item?.url))
    .map((item) => ({ label: item.label, href: item.url }))
}

export function resolveCompanyName(settings: SiteSetting | null | undefined): string {
  return settings?.companyName?.trim() || 'Forest Catering'
}
