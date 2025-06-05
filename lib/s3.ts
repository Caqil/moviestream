
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Settings } from '@/models/Settings';
import { connectToDatabase } from './db';

let s3Client: S3Client | null = null;
let s3Config: any = null;

export async function initializeS3(): Promise<void> {
  await connectToDatabase();
  const settings = await Settings.findOne();
  
  if (!settings?.s3.isEnabled) {
    throw new Error('S3 is not configured or enabled');
  }

  s3Config = settings.s3;
  
  const config: any = {
    region: s3Config.region,
    credentials: {
      accessKeyId: s3Config.accessKeyId,
      secretAccessKey: s3Config.secretAccessKey,
    },
  };

  if (s3Config.endpoint) {
    config.endpoint = s3Config.endpoint;
    config.forcePathStyle = s3Config.forcePathStyle;
  }

  s3Client = new S3Client(config);
}

export function getS3Client(): S3Client {
  if (!s3Client) {
    throw new Error('S3 client not initialized. Call initializeS3() first.');
  }
  return s3Client;
}

export function getS3Config() {
  if (!s3Config) {
    throw new Error('S3 config not loaded. Call initializeS3() first.');
  }
  return s3Config;
}

export async function uploadToS3(
  key: string,
  body: Buffer | Uint8Array,
  contentType: string,
  metadata?: Record<string, string>
): Promise<string> {
  const client = getS3Client();
  const config = getS3Config();

  const command = new PutObjectCommand({
    Bucket: config.bucketName,
    Key: key,
    Body: body,
    ContentType: contentType,
    Metadata: metadata,
  });

  await client.send(command);

  return config.cdnUrl 
    ? `${config.cdnUrl}/${key}`
    : `https://${config.bucketName}.s3.${config.region}.amazonaws.com/${key}`;
}

export async function deleteFromS3(key: string): Promise<void> {
  const client = getS3Client();
  const config = getS3Config();

  const command = new DeleteObjectCommand({
    Bucket: config.bucketName,
    Key: key,
  });

  await client.send(command);
}

export async function getPresignedUrl(
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  const client = getS3Client();
  const config = getS3Config();

  const command = new GetObjectCommand({
    Bucket: config.bucketName,
    Key: key,
  });

  return await getSignedUrl(client, command, { expiresIn });
}
