import { NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebaseAdmin';
import { requireAuth } from '@/lib/apiAuth';

export async function GET() {
  try {
    const db = getAdminFirestore();
    const snapshot = await db.collection('services').get();
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json({ success: true, data: items });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!(await requireAuth())) {
      return NextResponse.json({ success: false, message: 'غير مصرح بالوصول' }, { status: 401 });
    }

    const body = await request.json();
    if (!body.id || !body.titleAr) {
      return NextResponse.json({ success: false, message: 'معرف الخدمة واسمها بالعربية مطلوبان' }, { status: 400 });
    }

    const db = getAdminFirestore();
    const docRef = db.collection('services').doc(body.id);
    const existing = await docRef.get();

    if (existing.exists) {
      return NextResponse.json({ success: false, message: 'خدمة بهذا المعرف موجودة بالفعل' }, { status: 409 });
    }

    const newItem = {
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await docRef.set(newItem);
    return NextResponse.json({ success: true, data: newItem });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
