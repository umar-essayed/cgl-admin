import { NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebaseAdmin';
import { requireAuth } from '@/lib/apiAuth';

export async function GET() {
  try {
    if (!(await requireAuth())) {
      return NextResponse.json({ success: false, message: 'غير مصرح بالوصول' }, { status: 401 });
    }

    const db = getAdminFirestore();
    const snapshot = await db.collection('rfq_requests').orderBy('createdAt', 'desc').get();
    const rfqs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json({ success: true, data: rfqs });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// Public endpoint to receive quote requests from CGL website
export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.fullName || !body.phone) {
      return NextResponse.json({ success: false, message: 'الاسم ورقم الهاتف مطلوبان' }, { status: 400 });
    }

    const db = getAdminFirestore();
    const docRef = db.collection('rfq_requests').doc();
    const rfqData = {
      ...body,
      id: docRef.id,
      status: 'new', // new | reviewed | contacted | closed
      createdAt: new Date().toISOString()
    };

    await docRef.set(rfqData);
    return NextResponse.json({ success: true, data: rfqData });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
