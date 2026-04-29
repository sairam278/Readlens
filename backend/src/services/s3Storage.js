const { S3Client, PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId:     process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET = process.env.S3_BUCKET_NAME;

async function uploadToS3(userId, fileBuffer, originalName) {
  const key = `${userId}/${Date.now()}_${originalName}`;

  await s3.send(new PutObjectCommand({
    Bucket:      BUCKET,
    Key:         key,
    Body:        fileBuffer,
    ContentType: "application/pdf",
  }));

  return key; // stored in documents.file_key column
}

async function deleteFromS3(key) {
  await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}

module.exports = { uploadToS3, deleteFromS3 };
