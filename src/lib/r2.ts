import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';

const accountId = process.env.R2_ACCOUNT_ID || '07079473a194adefc9183b88f04405f4';
const accessKeyId = process.env.R2_ACCESS_KEY_ID || 'f4c1d16361adf60eac38b49953c0be5f';
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || '3633b7bcab70fcbe6878570c1a9cf0c5f4ad629bcc716a9f310b006a464254fa';
export const R2_BUCKET = process.env.R2_BUCKET_NAME || 'cgl';

export const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

export async function uploadToR2({
  buffer,
  key,
  contentType,
}: {
  buffer: Buffer;
  key: string;
  contentType: string;
}) {
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  });

  await r2Client.send(command);

  // If public domain is configured, use it, otherwise use local proxy API
  const publicDomain = process.env.R2_PUBLIC_DOMAIN?.replace(/\/+$/, '');
  if (publicDomain) {
    return `${publicDomain}/${key}`;
  }

  return `/api/media/${key}`;
}

export async function deleteFromR2(key: string) {
  const command = new DeleteObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
  });
  await r2Client.send(command);
}

export async function getFromR2(key: string) {
  const command = new GetObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
  });
  return await r2Client.send(command);
}
