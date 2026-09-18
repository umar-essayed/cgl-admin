import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync, existsSync } from 'fs';

function getServiceAccount() {
  const path = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || '/media/omar/second/cgl/gcll-70b0d-firebase-adminsdk-fbsvc-ac59a361c0.json';
  if (existsSync(/*turbopackIgnore: true*/ path)) {
    return JSON.parse(readFileSync(/*turbopackIgnore: true*/ path, 'utf8'));
  }
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
  }
  throw new Error(`Firebase service account file not found at ${path}`);
}

export function getAdminFirestore() {
  if (!getApps().length) {
    const serviceAccount = getServiceAccount();
    initializeApp({
      credential: cert(serviceAccount)
    });
  }
  return getFirestore();
}
