/**
 * Cloud Storage client — S3-compatible API via @aws-sdk/client-s3
 * Compatible dengan Cloudflare R2, Backblaze B2, dan AWS S3.
 *
 * Environment variables yang diperlukan:
 *   STORAGE_ENDPOINT     = Full endpoint URL storage
 *                          - Backblaze B2: https://s3.us-west-004.backblazeb2.com
 *                          - Cloudflare R2: https://ACCOUNT_ID.r2.cloudflarestorage.com
 *   R2_ACCESS_KEY_ID     = Access Key ID (Backblaze: keyID, R2: access key)
 *   R2_SECRET_ACCESS_KEY = Secret Key (Backblaze: applicationKey, R2: secret key)
 *   R2_BUCKET_NAME       = Nama bucket (contoh: photobooth-photos)
 */
const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} = require('@aws-sdk/client-s3');

const endpoint = process.env.STORAGE_ENDPOINT;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

const BUCKET_NAME = process.env.R2_BUCKET_NAME || 'photobooth-photos';

// Client hanya dibuat jika credentials tersedia
const r2Client =
  endpoint && accessKeyId && secretAccessKey
    ? new S3Client({
        region: 'auto',
        endpoint,
        credentials: { accessKeyId, secretAccessKey },
        forcePathStyle: true, // Diperlukan untuk Backblaze B2
      })
    : null;

/**
 * Upload file ke R2 bucket.
 * @param {string} key - Nama file/key di bucket (contoh: "photo_uuid.png")
 * @param {Buffer} body - Buffer konten file
 * @param {string} contentType - MIME type (contoh: "image/png")
 * @returns {Promise<void>}
 */
async function uploadFile(key, body, contentType) {
  if (!r2Client) throw new Error('R2 client tidak terkonfigurasi. Cek CF_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY di .env');

  await r2Client.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: 'private, max-age=3600',
    })
  );
}

/**
 * Download file dari R2 bucket.
 * @param {string} key - Nama file/key di bucket
 * @returns {Promise<{ body: ReadableStream|Buffer, contentType: string }>}
 */
async function downloadFile(key) {
  if (!r2Client) throw new Error('R2 client tidak terkonfigurasi.');

  const response = await r2Client.send(
    new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    })
  );

  return {
    body: response.Body,
    contentType: response.ContentType || 'application/octet-stream',
  };
}

/**
 * Hapus file dari R2 bucket.
 * @param {string} key - Nama file/key di bucket
 * @returns {Promise<void>}
 */
async function deleteFile(key) {
  if (!r2Client) throw new Error('R2 client tidak terkonfigurasi.');

  await r2Client.send(
    new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    })
  );
}

/**
 * Cek apakah file ada di R2 bucket.
 * @param {string} key
 * @returns {Promise<boolean>}
 */
async function fileExists(key) {
  if (!r2Client) return false;
  try {
    await r2Client.send(new HeadObjectCommand({ Bucket: BUCKET_NAME, Key: key }));
    return true;
  } catch {
    return false;
  }
}

/**
 * Cek apakah R2 client terkonfigurasi dengan benar.
 * @returns {boolean}
 */
function isConfigured() {
  return r2Client !== null;
}

module.exports = { uploadFile, downloadFile, deleteFile, fileExists, isConfigured, BUCKET_NAME };
