import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import path from 'path';

export const runtime = 'nodejs';

const s3 = new S3Client({ region: process.env.AWS_REGION ?? 'eu-north-1' });
const BUCKET = process.env.S3_BUCKET ?? 'm8carsimages-591446362427-eu-north-1-an';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = path.extname(file.name) || '.jpg';
    const key = `vehicles/${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;

    await s3.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: file.type || 'image/jpeg',
    }));

    const url = `https://${BUCKET}.s3.eu-north-1.amazonaws.com/${key}`;
    return NextResponse.json({ url }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Image upload error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
