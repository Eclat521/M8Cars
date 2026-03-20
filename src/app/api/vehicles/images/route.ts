import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export async function POST(req: NextRequest) {
  try {
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      console.error('BLOB_READ_WRITE_TOKEN is not set');
      return NextResponse.json({ error: 'Storage not configured (missing BLOB_READ_WRITE_TOKEN)' }, { status: 500 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

    const blob = await put(file.name, file, { access: 'public', token });

    return NextResponse.json({ url: blob.url }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Image upload error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
