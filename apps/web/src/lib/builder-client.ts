import { builder } from '@builder.io/sdk-react-nextjs';

const apiKey = process.env.NEXT_PUBLIC_BUILDER_API_KEY;
if (!apiKey) {
  throw new Error(
    'NEXT_PUBLIC_BUILDER_API_KEY is not set. Add it to your .env file.',
  );
}

builder.init(apiKey);

export { builder };
