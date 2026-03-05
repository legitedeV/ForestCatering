import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { fetchOneEntry, BUILDER_API_KEY, BUILDER_MODEL_NAME } from '@/lib/builder-client';
import { BuilderPage } from '@/components/builder/BuilderPage';

type Args = {
  params: Promise<{ page: string[] }>;
};

async function getBuilderContent(urlPath: string) {
  if (!BUILDER_API_KEY) return null;
  return fetchOneEntry({
    model: BUILDER_MODEL_NAME,
    apiKey: BUILDER_API_KEY,
    userAttributes: { urlPath },
  });
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { page } = await params;
  const urlPath = '/' + page.join('/');
  const content = await getBuilderContent(urlPath);

  return {
    title: content?.data?.title || 'Forest Hub',
    description: content?.data?.description || '',
  };
}

export default async function CatchAllPage({ params }: Args) {
  const { page } = await params;
  const urlPath = '/' + page.join('/');
  const content = await getBuilderContent(urlPath);

  if (!content) {
    notFound();
  }

  return <BuilderPage content={content} model={BUILDER_MODEL_NAME} />;
}
