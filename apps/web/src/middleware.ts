import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const EXCLUDED_PREFIXES = ['/admin', '/api', '/_next', '/access', '/page-editor']
const EXCLUDED_EXACT = ['/favicon.ico', '/robots.txt', '/sitemap.xml']

async function sign(value: string, secret: string) {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )

  const signature = await crypto.subtle.sign('HMAC', key, enc.encode(value))
  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const sitePassword = process.env.SITE_PASSWORD

  if (!sitePassword) return NextResponse.next()

  if (EXCLUDED_PREFIXES.some((p) => pathname.startsWith(p))) return NextResponse.next()
  if (EXCLUDED_EXACT.includes(pathname)) return NextResponse.next()

  const previewSecret = request.nextUrl.searchParams.get('preview_secret')
  if (previewSecret && previewSecret === process.env.PAYLOAD_PREVIEW_SECRET) {
    return NextResponse.next()
  }

  const cookie = request.cookies.get('fc_prelaunch_access')?.value
  const expected = `ok.${await sign('ok', sitePassword)}`

  if (cookie === expected) return NextResponse.next()

  const returnTo = encodeURIComponent(`${pathname}${search}`)
  return NextResponse.redirect(new URL(`/access?returnTo=${returnTo}`, request.url))
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
}
