import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session.authenticated) {
    return NextResponse.json(
      { authenticated: false, message: 'انتهت مدة الجلسة (ساعتان)، يرجى تسجيل الدخول مجدداً' },
      { status: 401 }
    );
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      email: session.email,
      name: session.name,
      role: session.role,
      expiresAt: session.expiresAt
    }
  });
}
