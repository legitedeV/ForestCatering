import { NextResponse } from 'next/server'
import crypto from 'node:crypto'

function sign(value: string, secret: string) {
  return crypto.createHmac('sha256', secret).update(value).digest('hex')
}

export async function POST(request: Request) {
  const { password } = await request.json()

  const secret = process.env.SITE_PASSWORD
  if (!secret) return new NextResponse('Server misconfigured', { status: 500 })

  if (password !== secret) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const response = NextResponse.json({ success: true })
  const token = `ok.${sign('ok', secret)}`

  response.cookies.set('fc_prelaunch_access', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24,
  })

  return response
}
