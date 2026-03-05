export const BUILDER_API_KEY =
  process.env.NEXT_PUBLIC_BUILDER_API_KEY ?? '';

export const BUILDER_MODEL_NAME = 'page';

export { fetchOneEntry, Content } from '@builder.io/sdk-react-nextjs';
