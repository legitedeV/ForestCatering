import AccessForm from './AccessForm'

type AccessPageProps = {
  searchParams: Promise<{
    returnTo?: string
  }>
}

export default async function AccessPage({ searchParams }: AccessPageProps) {
  const params = await searchParams
  const returnTo = params.returnTo || '/'

  return <AccessForm returnTo={returnTo} />
}
