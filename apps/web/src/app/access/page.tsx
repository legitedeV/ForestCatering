import { redirect } from 'next/navigation'

import AccessForm from './AccessForm'

type AccessPageProps = {
  searchParams: Promise<{
    returnTo?: string
  }>
}

function sanitizeReturnTo(returnTo?: string) {
  if (!returnTo) return '/'
  return returnTo.startsWith('/') ? returnTo : '/'
}

export default async function AccessPage({ searchParams }: AccessPageProps) {
  if (!process.env.SITE_PASSWORD) {
    redirect('/')
  }

  const params = await searchParams
  const returnTo = sanitizeReturnTo(params.returnTo)

  return <AccessForm returnTo={returnTo} />
}
