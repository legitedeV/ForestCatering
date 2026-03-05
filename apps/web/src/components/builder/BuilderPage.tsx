'use client';

import { Content } from '@builder.io/sdk-react-nextjs';
import { registeredComponents } from './registered-components';

type BuilderPageProps = {
  content: unknown;
  model: string;
};

export function BuilderPage({ content, model }: BuilderPageProps) {
  return (
    <Content
      content={content}
      model={model}
      customComponents={registeredComponents}
      apiKey={process.env.NEXT_PUBLIC_BUILDER_API_KEY!}
    />
  );
}
