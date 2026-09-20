import crypto from 'crypto';
import { cookies } from 'next/headers';

const SECRET = process.env.JWT_SECRET || 'cgl_executive_secure_control_center_key_2026_988421';
const COOKIE_NAME = 'cgl_admin_session';

export const SESSION_MAX_AGE_SECONDS = 2 * 60 * 60; // 2 hours (7,200 seconds)
export const SESSION_MAX_AGE_MS = SESSION_MAX_AGE_SECONDS * 1000; // 2 hours (7,200,000 ms)

export function hashPassword(password: string): string {
  return crypto.createHmac('sha256', SECRET).update(password).digest('hex');
}

export function createSessionToken(email: string, meta?: { name?: string; role?: string }): string {
  const timestamp = Date.now();
  const payload = Buffer.from(JSON.stringify({ 
    email, 
    name: meta?.name || 'مشرف النظام', 
    role: meta?.role || 'superadmin', 
    timestamp 
  })).toString('base64url');
  const signature = crypto.createHmac('sha256', SECRET).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

export function verifySessionToken(token: string): { valid: boolean; email?: string; name?: string; role?: string; expiresAt?: number } {
  try {
    const [payload, signature] = token.split('.');
    if (!payload || !signature) return { valid: false };

    const expectedSig = crypto.createHmac('sha256', SECRET).update(payload).digest('base64url');
    if (crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
      const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
      // Session expires strictly after 2 hours
      if (Date.now() - data.timestamp > SESSION_MAX_AGE_MS) {
        return { valid: false };
      }
      return { 
        valid: true, 
        email: data.email,
        name: data.name,
        role: data.role,
        expiresAt: data.timestamp + SESSION_MAX_AGE_MS
      };
    }
    return { valid: false };
  } catch {
    return { valid: false };
  }
}

export async function getSession(): Promise<{ authenticated: boolean; email?: string; name?: string; role?: string; expiresAt?: number }> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(COOKIE_NAME);
  if (!sessionCookie?.value) {
    return { authenticated: false };
  }

  const { valid, email, name, role, expiresAt } = verifySessionToken(sessionCookie.value);
  return { authenticated: valid, email, name, role, expiresAt };
}
