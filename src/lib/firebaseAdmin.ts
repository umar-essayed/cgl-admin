import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync, existsSync } from 'fs';
import path from 'path';

// Embedded fallback credentials for production deployment
const EMBEDDED_SERVICE_ACCOUNT = {
  type: "service_account",
  project_id: "gcll-70b0d",
  private_key_id: "ac59a361c0b015ed9ccea168f48f209912314e25",
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCvwhrb4zR6unkl\nrcgUggrEfXw9y07bsuo86biHpeCpW1TxWmYH8seX/sFG/Tz8Q7twiX4oQEPhgjLb\nzxi/lg9SFnmxGRnxJ5w27Q478ps8MNZdhVroOCBSfxuVzRjJDsTmRuMui9gZZten\nX5FWnKtv9ZhV57QIFRfZ9FpAPlc5HT3scQ9fIm0HJ/Af7dmlrnNBC9XuhqQ2Ds0X\nuxPLrDE+75gLDUSp6Cqx3bu/WlGIGh63Xz7JqJIA2AEWZmI+PDfsz5N77p+cJuNa\nF6uQ9S7b8v8QMCJcqo0rdVsaZH0do+6xq86S/tTVrbownPax7UsnVWyQVX8c489K\njtyAz049AgMBAAECggEACwiVcd5jXTadnY1TG5TgvJF5t9HIKcFwNDi77XZ7xXkt\nVCV623h7Q5up+7aw5s+qhOSsxDW2M5vEoGK+e/1Qoueasup149shUs7/VY+wyehX\nwyRr0fSY2ttatCtdXF0OZIjPGqa+zAFvyMF87A7Ty47qBeKQ1vBA2hCD8rdQxHRq\nko7AtxTJ69P8drM0G8aycEWAih80Sl4ZnbBd3QgciYPaYT59JTm3u6PpxhH7pJre\nZ3eb51MApqVrFyvUfJLMg3gRhZeqXGN1lI8yfClmjNvVv3UESnT/JMHwYddsAQJD\nt2R8velrrcuAwAzvkOVeD0Dyb6L3/gy4I2kosOCZBQKBgQDmN1cAv9FCvckJCiGp\nSe71NAtWwoq/AAn+peBxQnXgdaEQNyzZteIgjWIbWnWF94Bcb99u499cdtRiaUSu\nQB1UL3Xz3ryoGzEr0EdrDql1U8chSTCxT4/kEB7hhAIglVtVChE6xZcNaWx6hKz8\noGvG7q4TY0u+efFZ2UlGKlcsgwKBgQDDcV6ylEWqhzoF97CPphRzkwXMKmtfzjfU\nqvOQioILJOZ/2DP/P+hP0rGGD+la90Zg+mdMP83qLvOxzfDaohyU+Q+XLDkTXTR3\nD6hdK/L5fnck1+MyA6DW3mpz06Y1B+y2kpjQdTl8OyMC8cJg30IjbNJNR6HTML9f\nvkYKmAwePwKBgQCGNz1B8pLNllfeLUnyqGfoDK+PpVu+fwdUruBrJ5QRiIKeMYy0\nYJW05LiNue9Ka0Eqow5gV/mgrqajuTuRW0++BO1/gBv85d2E7ai1gZbKEE3H2iPJ\nO9ln3P4j/BJBbNISggwJd6jY6N2VkERKBDzRfdV++CTwp6dN+p/9iDHKgQKBgDOv\n489ujw4OPTYezz7uOTJni3z3KvZnXzSLEWcEemfgFmVxFC9JA3M40WIXCyvXgXFc\nR71OknKAgEphoHTxsoVjaNAeDeolGB70sR4S5Ws+GtxPi/JKK1sn7xc6vhYARoXy\nNx/KIK3OJfA9Z56e7KrZuLRfYVis56+2bmeW1n2ZAoGBAIVHCU2+hlOHHtDtFHvQ\ntFGsON6N3uEpYpBDXesaQErENuBBd8fPfMs/1PNwM40EzNdBuv8Ji8iVOJz3tUQ5\n7PUL5lEsyty+qBWkAWiYPhtt9fVrS9YNSiV8Z30bmhqiVOLvKFJLfvIv8+WqXvqI\nlfDsbLqz1SH05cB2Ba0of8/N\n-----END PRIVATE KEY-----\n",
  client_email: "firebase-adminsdk-fbsvc@gcll-70b0d.iam.gserviceaccount.com",
  client_id: "102039170025804963857",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40gcll-70b0d.iam.gserviceaccount.com",
  universe_domain: "googleapis.com"
};

function getServiceAccount() {
  // 1. Check environment variable FIREBASE_SERVICE_ACCOUNT_KEY (supports raw JSON or base64)
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    try {
      const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY.trim();
      if (raw.startsWith('{')) {
        return JSON.parse(raw);
      }
      return JSON.parse(Buffer.from(raw, 'base64').toString('utf8'));
    } catch (e) {
      console.warn('Could not parse FIREBASE_SERVICE_ACCOUNT_KEY, falling back...');
    }
  }

  // 2. Check discrete environment variables
  if (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    return {
      projectId: process.env.FIREBASE_PROJECT_ID || 'gcll-70b0d',
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    };
  }

  // 3. Check local file paths if available
  const localCandidates = [
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH,
    path.join(process.cwd(), 'firebase-service-account.json'),
    '/media/omar/second/cgl/gcll-70b0d-firebase-adminsdk-fbsvc-ac59a361c0.json'
  ].filter(Boolean) as string[];

  for (const p of localCandidates) {
    if (existsSync(p)) {
      try {
        return JSON.parse(readFileSync(p, 'utf8'));
      } catch (err) {
        // ignore
      }
    }
  }

  // 4. Fallback to embedded credentials so production never fails
  return EMBEDDED_SERVICE_ACCOUNT;
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
