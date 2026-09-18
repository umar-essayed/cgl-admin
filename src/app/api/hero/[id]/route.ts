import { NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebaseAdmin';
import { requireAuth } from '@/lib/apiAuth';
import { triggerWebsiteRevalidation } from '@/lib/revalidateWebsite';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getAdminFirestore();
    const doc = await db.collection('hero_slides').doc(id).get();
    if (!doc.exists) {
      return NextResponse.json({ success: false, message: 'السلايد غير موجود' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: { id: doc.id, ...doc.data() } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await requireAuth())) {
      return NextResponse.json({ success: false, message: 'غير مصرح بالوصول' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const db = getAdminFirestore();
    const docRef = db.collection('hero_slides').doc(id);

    const updatedData: any = {
      ...body,
      updatedAt: new Date().toISOString()
    };

    if (body.duration !== undefined) {
      updatedData.duration = Number(body.duration) > 0 ? Number(body.duration) : 6;
    }
    if (body.order !== undefined) {
      updatedData.order = Number(body.order) > 0 ? Number(body.order) : 1;
    }
    if (body.isActive !== undefined) {
      updatedData.isActive = body.isActive === true || body.isActive === 'true';
    }

    await docRef.set(updatedData, { merge: true });
    triggerWebsiteRevalidation();

    return NextResponse.json({ success: true, data: { id, ...updatedData } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await requireAuth())) {
      return NextResponse.json({ success: false, message: 'غير مصرح بالوصول' }, { status: 401 });
    }

    const { id } = await params;
    const db = getAdminFirestore();
    await db.collection('hero_slides').doc(id).delete();
    triggerWebsiteRevalidation();

    return NextResponse.json({ success: true, message: 'تم حذف السلايد بنجاح' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
