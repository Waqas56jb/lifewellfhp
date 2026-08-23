import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function authorized(req: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) return true;
  const header = req.headers.get('x-revalidate-secret');
  const url = new URL(req.url);
  return header === secret || url.searchParams.get('secret') === secret;
}

export async function POST(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ success: false }, { status: 401 });
  }
  revalidatePath('/', 'layout');
  revalidatePath('/blog', 'page');
  revalidatePath('/blog/[slug]', 'page');
  return NextResponse.json({ success: true });
}

export async function GET(req: Request) {
  return POST(req);
}
