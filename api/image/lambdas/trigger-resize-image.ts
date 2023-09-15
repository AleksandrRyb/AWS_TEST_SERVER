import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import jimp from 'jimp';
import { s3Client } from '@services/s3';
import { log } from '@helper/logger';

export const handler = async (event: any) => {
  const { Records } = event;
  const width = 250;
  const height = 512;

  for (const record of Records) {
    try {
      const bucket = record.s3.bucket.name;
      const file = record.s3.object.key;

      const getObjectParams = { Bucket: bucket, Key: file };

      const getObjectCommand = new GetObjectCommand(getObjectParams);
      const responseBody = (await s3Client.send(getObjectCommand)).Body;

      const imageBuffer = await getObjectBuffer(responseBody as Readable);

      const resizedImageBuffer = await getResizdObjectBuffer(imageBuffer, width, height);

      const [filePath, fileExtension] = file.split('.');
      const fileKey = filePath.split('/')[1];

      log(
        JSON.stringify({
          putObjectParams: {
            Bucket: bucket,
            Key: `resized/${fileKey}_SC.${fileExtension}`,
            Body: resizedImageBuffer,
          },
        })
      );

      const s3Params = {
        Bucket: bucket,
        Key: `resized/${fileKey}_SC.${fileExtension}`,
        Body: resizedImageBuffer,
      };

      const putObjectCommand = new PutObjectCommand(s3Params);

      await s3Client.send(putObjectCommand);

      log(JSON.stringify({ message: 'Image Resize successfully done' }));
    } catch (error) {
      error(JSON.stringify({ error: error.message }));
    }
  }
};

const getResizdObjectBuffer = async (buffer: Buffer, width: number, height: number) => {
  try {
    const jimpImage = await jimp.read(buffer);
    const mime = jimpImage.getMIME();

    const resizedImageBuffer = await jimpImage.scaleToFit(width, height).getBufferAsync(mime);

    return resizedImageBuffer;
  } catch (error) {
    throw new Error(error.message);
  }
};

async function getObjectBuffer(stream) {
  return new Promise<Buffer>((resolve, reject) => {
    const chunks = [] as any;

    stream.once('error', (error) => reject(error.message));

    stream.on('data', (chunk) => chunks.push(chunk));

    stream.once('end', () => resolve(Buffer.concat(chunks)));
  });
}
