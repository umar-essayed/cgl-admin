import { cookies } from 'next/headers';
import { verifySessionToken } from './auth';

export async function requireAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get('cgl_admin_session')?.value;
  if (!session) return false;
  const { valid } = verifySessionToken(session);
  return valid;
}
