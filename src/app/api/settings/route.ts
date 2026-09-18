import { NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebaseAdmin';
import { requireAuth } from '@/lib/apiAuth';
import { triggerWebsiteRevalidation } from '@/lib/revalidateWebsite';

export async function GET() {
  try {
    const db = getAdminFirestore();
    const doc = await db.collection('settings').doc('company_info').get();
    if (!doc.exists) {
      return NextResponse.json({ success: false, message: 'الإعدادات غير موجودة' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: doc.data() });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    if (!(await requireAuth())) {
      return NextResponse.json({ success: false, message: 'غير مصرح بالوصول' }, { status: 401 });
    }

    const body = await request.json();
    const db = getAdminFirestore();

    const updatedData = {
      ...body,
      updatedAt: new Date().toISOString()
    };

    await db.collection('settings').doc('company_info').set(updatedData, { merge: true });
    triggerWebsiteRevalidation();
    return NextResponse.json({ success: true, data: updatedData });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
