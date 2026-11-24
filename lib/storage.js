// =============================================================
// lib/storage.js: photo storage.
//
// PLACEHOLDER: photos are NOT saved anywhere yet. We only create the
// file name (the "key") that will be used in Amazon S3 later.
// =============================================================
import crypto from "node:crypto";

// Saves a photo and returns its key, e.g. "reports/3f2a...e1.jpg".
// The file name is random (crypto.randomUUID), never the user's file name.
export async function uploadPhoto(buffer, ext, contentType) {
  const key = `reports/${crypto.randomUUID()}.${ext}`;

  // TODO: upload to Amazon S3
  // Example (install first: npm install @aws-sdk/client-s3):
  //
  // import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
  //
  // // No access keys here! On EC2 the SDK automatically uses the
  // // IAM Role attached to the instance.
  // const s3 = new S3Client({ region: process.env.AWS_REGION });
  //
  // await s3.send(new PutObjectCommand({
  //   Bucket: process.env.S3_BUCKET,
  //   Key: key,
  //   Body: buffer,
  //   ContentType: contentType,
  // }));

  return key;
}

// Returns a URL the browser can use to show the photo, or null.
export async function getPhotoUrl(key) {
  if (!key) return null;

  // TODO: upload to Amazon S3 (then return a pre-signed URL here)
  // Example (install first: npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner):
  //
  // import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
  // import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
  //
  // const s3 = new S3Client({ region: process.env.AWS_REGION });
  //
  // // The bucket stays PRIVATE. A pre-signed URL gives temporary
  // // access to one photo (here: 5 minutes).
  // return getSignedUrl(
  //   s3,
  //   new GetObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key }),
  //   { expiresIn: 300 }
  // );

  return null; // No real photo yet. The page shows a placeholder box.
}
