import { NextResponse } from 'next/server';
import { uploadToR2 } from '@/lib/r2';
import { requireAuth } from '@/lib/apiAuth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    if (!(await requireAuth())) {
      return NextResponse.json({ success: false, message: 'غير مصرح بالوصول' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'uploads';

    if (!file) {
      return NextResponse.json({ success: false, message: 'لم يتم إرسال أي ملف' }, { status: 400 });
    }

    // Allowed mime types (Images, Videos, PDFs)
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/svg+xml',
      'image/gif',
      'application/pdf',
      'video/mp4',
      'video/webm',
      'video/quicktime',
      'video/ogg',
      'video/x-m4v'
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: 'نوع الملف غير مدعوم، يرجى رفع صورة (PNG, JPG, WebP) أو فيديو (MP4, WebM) أو ملف PDF' },
        { status: 400 }
      );
    }

    // Limit to 60MB for videos and media
    const MAX_SIZE = 60 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, message: 'حجم الملف يتجاوز الحد المسموح به (60 ميجابايت)' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Clean file extension
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const timestamp = Date.now();
    const key = `${folder}/${timestamp}_${originalName}`;

    const url = await uploadToR2({
      buffer,
      key,
      contentType: file.type,
    });

    return NextResponse.json({
      success: true,
      url,
      key,
      size: file.size,
      type: file.type,
    });
  } catch (error: any) {
    console.error('R2 upload error:', error);
    return NextResponse.json(
      { success: false, message: 'فشل في رفع الملف إلى Cloudflare R2', error: error.message },
      { status: 500 }
    );
  }
}
