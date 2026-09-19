import { NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebaseAdmin';
import { requireAuth } from '@/lib/apiAuth';
import { triggerWebsiteRevalidation } from '@/lib/revalidateWebsite';

export async function GET() {
  try {
    const db = getAdminFirestore();
    const snapshot = await db.collection('projects').get();
    const projects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json({ success: true, data: projects });
  } catch (error: any) {
    console.error('Error fetching projects:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!(await requireAuth())) {
      return NextResponse.json({ success: false, message: 'غير مصرح بالوصول' }, { status: 401 });
    }

    const body = await request.json();
    if (!body.id || !body.nameAr) {
      return NextResponse.json({ success: false, message: 'معرف المشروع واسمه بالعربية مطلوبان' }, { status: 400 });
    }

    const db = getAdminFirestore();
    const docRef = db.collection('projects').doc(body.id);
    const existing = await docRef.get();

    if (existing.exists) {
      return NextResponse.json({ success: false, message: 'مشروع بهذا المعرف موجود بالفعل' }, { status: 409 });
    }

    const newProject = {
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await docRef.set(newProject);
    triggerWebsiteRevalidation();
    return NextResponse.json({ success: true, data: newProject });
  } catch (error: any) {
    console.error('Error creating project:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
