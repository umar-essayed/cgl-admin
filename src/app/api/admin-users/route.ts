import { NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebaseAdmin';
import { requireAuth } from '@/lib/apiAuth';
import { hashPassword } from '@/lib/auth';

export async function GET() {
  try {
    if (!(await requireAuth())) {
      return NextResponse.json({ success: false, message: 'غير مصرح بالوصول' }, { status: 401 });
    }

    const db = getAdminFirestore();
    const snapshot = await db.collection('admin_users').orderBy('createdAt', 'desc').get();
    
    const dbUsers = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        email: data.email,
        role: data.role || 'admin',
        status: data.status || 'active',
        createdAt: data.createdAt,
        lastLoginAt: data.lastLoginAt || null,
        isRoot: false
      };
    });

    // Add root system owner at top
    const rootAdmin = {
      id: 'root-super-admin',
      name: 'مدير النظام الرئيسي (System Owner)',
      email: (process.env.ADMIN_EMAIL || 'admin@cgl.sa').toLowerCase(),
      role: 'superadmin',
      status: 'active',
      createdAt: '2026-01-01T00:00:00.000Z',
      lastLoginAt: null,
      isRoot: true
    };

    return NextResponse.json({ 
      success: true, 
      data: [rootAdmin, ...dbUsers] 
    });
  } catch (error: any) {
    console.error('Error fetching admin users:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!(await requireAuth())) {
      return NextResponse.json({ success: false, message: 'غير مصرح بالوصول' }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, password, role = 'admin' } = body;

    if (!name || name.trim().length < 2) {
      return NextResponse.json({ success: false, message: 'الاسم مطلوب (حرفين على الأقل)' }, { status: 400 });
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return NextResponse.json({ success: false, message: 'يرجى إدخال بريد إلكتروني صالح' }, { status: 400 });
    }

    if (!password || password.length < 6) {
      return NextResponse.json({ success: false, message: 'كلمة المرور يجب أن لا تقل عن 6 خانات' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const rootEmail = (process.env.ADMIN_EMAIL || 'admin@cgl.sa').toLowerCase();

    if (cleanEmail === rootEmail) {
      return NextResponse.json({ success: false, message: 'هذا البريد محجوز لحساب النظام الرئيسي' }, { status: 400 });
    }

    const db = getAdminFirestore();
    const existing = await db.collection('admin_users').where('email', '==', cleanEmail).limit(1).get();
    if (!existing.empty) {
      return NextResponse.json({ success: false, message: 'هذا البريد الإلكتروني مسجل مسبقاً لمشرف آخر' }, { status: 400 });
    }

    const docRef = db.collection('admin_users').doc();
    const newUser = {
      name: name.trim(),
      email: cleanEmail,
      passwordHash: hashPassword(password),
      role, // 'superadmin' | 'admin' | 'editor'
      status: 'active',
      createdAt: new Date().toISOString(),
      lastLoginAt: null
    };

    await docRef.set(newUser);

    return NextResponse.json({ 
      success: true, 
      message: 'تم إنشاء حساب المشرف بنجاح',
      data: {
        id: docRef.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        status: newUser.status,
        createdAt: newUser.createdAt,
        isRoot: false
      }
    });
  } catch (error: any) {
    console.error('Error creating admin user:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
