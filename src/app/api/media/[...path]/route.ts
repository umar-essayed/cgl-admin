import { NextResponse } from 'next/server';
import { getFromR2 } from '@/lib/r2';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const key = path.map(p => decodeURIComponent(p)).join('/');

    const data = await getFromR2(key);

    if (!data.Body) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const bytes = await data.Body.transformToByteArray();

    return new Response(bytes as any, {
      status: 200,
      headers: {
        'Content-Type': data.ContentType || 'application/octet-stream',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error: any) {
    if (error.name === 'NoSuchKey' || error.$metadata?.httpStatusCode === 404) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
    console.error('Error serving media from R2:', error);
    return NextResponse.json({ error: 'Error serving file' }, { status: 500 });
  }
}

export async function HEAD(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const key = path.map(p => decodeURIComponent(p)).join('/');

    const data = await getFromR2(key);

    if (!data.Body) {
      return new Response(null, { status: 404 });
    }

    return new Response(null, {
      status: 200,
      headers: {
        'Content-Type': data.ContentType || 'application/octet-stream',
        'Content-Length': String(data.ContentLength || 0),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error: any) {
    if (error.name === 'NoSuchKey' || error.$metadata?.httpStatusCode === 404) {
      return new Response(null, { status: 404 });
    }
    return new Response(null, { status: 500 });
  }
}
