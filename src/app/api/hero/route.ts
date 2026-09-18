import { NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebaseAdmin';
import { requireAuth } from '@/lib/apiAuth';
import { triggerWebsiteRevalidation } from '@/lib/revalidateWebsite';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = getAdminFirestore();
    const snapshot = await db.collection('hero_slides').orderBy('order', 'asc').get();
    const slides = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json({ success: true, data: slides });
  } catch (error: any) {
    console.error('Error fetching hero slides:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!(await requireAuth())) {
      return NextResponse.json({ success: false, message: 'غير مصرح بالوصول' }, { status: 401 });
    }

    const body = await request.json();
    const slideId = body.id || `hero-slide-${Date.now()}`;

    if (!body.titleAr) {
      return NextResponse.json({ success: false, message: 'عنوان السلايد بالعربية مطلوب' }, { status: 400 });
    }

    const db = getAdminFirestore();
    const docRef = db.collection('hero_slides').doc(slideId);

    const newSlide = {
      id: slideId,
      order: Number(body.order) > 0 ? Number(body.order) : 99,
      isActive: body.isActive === false || body.isActive === 'false' ? false : true,
      type: body.type === 'video' ? 'video' : 'image',
      mediaUrl: body.mediaUrl || '/assets/sliders/slider1.jpg',
      tagAr: body.tagAr || '',
      tagEn: body.tagEn || '',
      metricsAr: body.metricsAr || '',
      metricsEn: body.metricsEn || '',
      titleAr: body.titleAr || '',
      titleEn: body.titleEn || '',
      subtitleAr: body.subtitleAr || '',
      subtitleEn: body.subtitleEn || '',
      duration: Number(body.duration) > 0 ? Number(body.duration) : 6,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await docRef.set(newSlide);
    triggerWebsiteRevalidation();

    return NextResponse.json({ success: true, data: newSlide });
  } catch (error: any) {
    console.error('Error creating hero slide:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
