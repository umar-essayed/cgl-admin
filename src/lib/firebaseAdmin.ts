import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync, existsSync } from 'fs';
import path from 'path';

// Embedded fallback credentials for production deployment
const EMBEDDED_SERVICE_ACCOUNT = {
  type: "service_account",
  project_id: "gccll-17a67",
  private_key_id: "47fcde5b3263864e28372b1153ad39f7e7633df9",
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC1hP0MqUhc6CwC\nnYtGbrr3+cPGqejBhcHqfzOAkgBFeKl9Y87jdjqTHENCa3IIOk+uN6mRLqJCb6l/\nPak2+9orFvhNKt+HSfAFwj8jNtwZIDnUT5P+P4NMJF1vUunFhoMD79V4cd8lef5d\njlkqTG9LhX/iAq/Acc87hMbK8oASFnphzptMkt7qt7tz9kCuNUhE7zUKK0K+LcfD\nfMOvMuGu6GNp3jwr9NZ2ra9aUUxFpmJNXkaswdKiyQ/OvWF3miW5BlGuU3x/CpN5\nhGTpw5CnTpJfEw4+uGYaYwhPNluaaMhpuTxDI/1ufIb7Q38Apy/o/gImYYJOBrdL\nEdCkg3B3AgMBAAECggEALgIGLYZerAXA2ezal0CLrTymLZ11PE/NxcT15dmbrgAW\nXYzFrIuT7yOTvKsFHSbCeXLsTLsYL2Sj/nc/g4s0UgWha9W5EE5iQuNoI2HNSaUM\nY07EQQYSHmN9NzE5xXIBlSbd4YhjOdmA6m+hFAKJlwfAUSXDLDDsiLZvuJLceTjB\nqzh8WQEkGQt06mgDRQ7ya2/mgF93sSfemoijUIaWzky0kL3odyJJv7afUpGfR+x6\nQ+9YxrmIVVklWoDbs0r4+QvyDyyipiTbgNRYjH2cPpSLbU9Dm0rtMSIoJJAFEtlm\nSGpfNBUTZNXPecDybkooA4TFIe9jDJ6UgmjjvCn56QKBgQDpyiUa5G5o4bL93BO9\nFabSghk6vwyd5Sc8fpwmct/TCUkdazstt7cqJO4yGraiY2oDpdmIQ2knhcYFGVP5\nXNd870ZSZDWxS/nmfRZABCib0YMXw4auTnPMZ5e0VO53gIkDDjPCwOl4hJRkQqXL\nPLZ1JZ7XL8nUXrt1ouP1bvtAAwKBgQDGw5z+fvWT6kt+yyzhIIdRLwjt0kNuHKxc\nGo3Dsz2pNdmraSNqWh9MhYZbva+v6qd6AN1lIbl3jGIaugBIJ3raaakj76feLKVq\n1FT4qyG36R/DoSHOQr3xX5UTTM6IAQ3pLTcZBp/PvN8NsPMzxPqyMwvvkmzhy1RN\nD8TXG9xlfQKBgQDDzEeNITkS38uPboyddI+1h73nhG/loTBeKs9OKDEqRoGUgOUc\nIdvmEO3oypSgpc/45CKuS3662f+A77hzhHz4plBn2oNZTH8ruSE0VgdIkIxRD7Ex\nNIUo8K2OGv9o2B5nj7Jr7jLae3boDSVbdCp/LBW+tMg882XeXKC8QclszwKBgCy9\nm3kt2tmQw62mzlNenxcHH1tpGQSQL7wLvh1vG1IbbQPIhtBJuQHgjH3aFNHkYA52\nY1+AV98xGmQpuiaDvIOthQUxzPeV1SZW5UmUO+LJ9vxyKMnk/Bx5B3VwtIyosBjs\ntJpNg2ufeBX83sGodUXnd6hVrWyl+DPgeM5y1wmBAoGAQ1vF8HhQQv2FO6CC7fkT\nNIr8nUNRkd/sTx1xD2A7v1SS4xHJT2kWVy6IwrSCnNVbtoFAlGZUVuFBZNr2dczW\nQTJpptFYQ6MM43dpawhl5AFaXTv2g8czCXAtNWVEiKi1ngUMJAUXoHXB18BPnex/\niAXkEkDbHOr6EFyO8zOG84Q=\n-----END PRIVATE KEY-----\n",
  client_email: "firebase-adminsdk-fbsvc@gccll-17a67.iam.gserviceaccount.com",
  client_id: "102077114480269244168",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40gccll-17a67.iam.gserviceaccount.com",
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
      projectId: process.env.FIREBASE_PROJECT_ID || 'gccll-17a67',
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    };
  }

  // 3. Check local file paths if available
  const localCandidates = [
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH,
    path.join(process.cwd(), 'firebase-service-account.json'),
    '/media/omar/second/cgl/gccll-17a67-firebase-adminsdk-fbsvc-47fcde5b32.json'
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
