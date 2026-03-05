import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const urlPath = body?.newValue?.data?.url || body?.previousValue?.data?.url || '/';

    revalidatePath(urlPath);
    revalidatePath('/');

    return NextResponse.json({ revalidated: true, path: urlPath });
  } catch {
    return NextResponse.json({ revalidated: false, error: 'Invalid payload' }, { status: 400 });
  }
}
