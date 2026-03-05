'use client';

import { Content, type BuilderContent } from '@builder.io/sdk-react-nextjs';
import { registeredComponents } from './registered-components';
import { BUILDER_API_KEY } from '@/lib/builder-client';

type BuilderPageProps = {
  content: BuilderContent | null;
  model: string;
};

export function BuilderPage({ content, model }: BuilderPageProps) {
  if (!content) return null;

  return (
    <Content
      content={content}
      model={model}
      customComponents={registeredComponents}
      apiKey={BUILDER_API_KEY}
    />
  );
}
