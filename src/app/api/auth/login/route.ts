import { NextResponse } from 'next/server';
import { createSessionToken, hashPassword } from '@/lib/auth';
import { getAdminFirestore } from '@/lib/firebaseAdmin';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'يرجى إدخال البريد الإلكتروني وكلمة المرور' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const expectedEmail = (process.env.ADMIN_EMAIL || 'admin@cgl.sa').toLowerCase();
    const expectedPassword = process.env.ADMIN_PASSWORD_HASH || 'cgl2026@secure';

    let authenticatedUser: { email: string; name: string; role: string } | null = null;

    // 1. Check Root Master Admin
    if (cleanEmail === expectedEmail && password === expectedPassword) {
      authenticatedUser = {
        email: expectedEmail,
        name: 'مدير النظام الرئيسي (Super Admin)',
        role: 'superadmin'
      };
    } else {
      // 2. Check Database Admin Users
      try {
        const db = getAdminFirestore();
        const snapshot = await db.collection('admin_users').where('email', '==', cleanEmail).limit(1).get();

        if (!snapshot.empty) {
          const userDoc = snapshot.docs[0];
          const userData = userDoc.data();

          if (userData.status === 'inactive') {
            return NextResponse.json(
              { success: false, message: 'هذا الحساب معطل حالياً، يرجى مراجعة إدارة النظام' },
              { status: 403 }
            );
          }

          const hashed = hashPassword(password);
          const isPasswordValid = 
            (userData.passwordHash && userData.passwordHash === hashed) || 
            userData.password === password;

          if (isPasswordValid) {
            authenticatedUser = {
              email: userData.email,
              name: userData.name || 'مشرف إداري',
              role: userData.role || 'admin'
            };

            // Update last login timestamp asynchronously
            userDoc.ref.update({
              lastLoginAt: new Date().toISOString()
            }).catch(e => console.error('Error updating lastLoginAt:', e));
          }
        }
      } catch (dbErr) {
        console.error('Error querying admin_users from Firestore:', dbErr);
      }
    }

    if (!authenticatedUser) {
      return NextResponse.json(
        { success: false, message: 'بيانات الدخول غير صحيحة، يرجى المحاولة مجدداً' },
        { status: 401 }
      );
    }

    const token = createSessionToken(authenticatedUser.email, {
      name: authenticatedUser.name,
      role: authenticatedUser.role
    });

    const response = NextResponse.json({
      success: true,
      message: 'تم تسجيل الدخول بنجاح',
      user: {
        name: authenticatedUser.name,
        email: authenticatedUser.email,
        role: authenticatedUser.role
      }
    });

    response.cookies.set('cgl_admin_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'حدث خطأ غير متوقع أثناء تسجيل الدخول' },
      { status: 500 }
    );
  }
}
