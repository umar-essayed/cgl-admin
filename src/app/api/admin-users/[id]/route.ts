import { NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebaseAdmin';
import { requireAuth } from '@/lib/apiAuth';
import { hashPassword } from '@/lib/auth';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await requireAuth())) {
      return NextResponse.json({ success: false, message: 'غير مصرح بالوصول' }, { status: 401 });
    }

    const { id } = await params;

    if (id === 'root-super-admin') {
      return NextResponse.json({ success: false, message: 'لا يمكن حذف الحساب الرئيسي للنظام' }, { status: 400 });
    }

    const db = getAdminFirestore();
    const docRef = db.collection('admin_users').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json({ success: false, message: 'الحساب غير موجود' }, { status: 404 });
    }

    await docRef.delete();
    return NextResponse.json({ success: true, message: 'تم حذف حساب المشرف بنجاح' });
  } catch (error: any) {
    console.error('Error deleting admin user:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await requireAuth())) {
      return NextResponse.json({ success: false, message: 'غير مصرح بالوصول' }, { status: 401 });
    }

    const { id } = await params;

    if (id === 'root-super-admin') {
      return NextResponse.json({ success: false, message: 'لا يمكن تعديل الحساب الرئيسي من هنا' }, { status: 400 });
    }

    const body = await request.json();
    const db = getAdminFirestore();
    const docRef = db.collection('admin_users').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json({ success: false, message: 'الحساب غير موجود' }, { status: 404 });
    }

    const updates: Record<string, any> = {
      updatedAt: new Date().toISOString()
    };

    if (body.status !== undefined) {
      updates.status = body.status === 'inactive' ? 'inactive' : 'active';
    }

    if (body.role !== undefined) {
      updates.role = body.role;
    }

    if (body.name !== undefined && body.name.trim().length >= 2) {
      updates.name = body.name.trim();
    }

    if (body.password && body.password.length >= 6) {
      updates.passwordHash = hashPassword(body.password);
    }

    await docRef.update(updates);
    return NextResponse.json({ success: true, message: 'تم تحديث بيانات الحساب بنجاح' });
  } catch (error: any) {
    console.error('Error updating admin user:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
