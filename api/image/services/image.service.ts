import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { s3Client } from '@services/s3';
import { dynamoDbClient } from '@services/dynamodb';
import { log } from '@helper/logger';
import { PutItemCommand } from '@aws-sdk/client-dynamodb';
import { getObjectBuffer, getResizdObjectBuffer } from '@helper/media';
import { Readable } from 'stream';
import { TABLES } from '@constants/tables';

interface ImageData {
  id: string;
  path: string;
  userId: string;
}
export class ImageService {
  static async findImage(searchTerm: string | undefined) {
    try {
      const result = await axios.get(
        `https://api.unsplash.com/search/photos?query=${searchTerm}&client_id=${process.env.UNSPLASH_ACCESS_KEY}`
      );

      return JSON.stringify({
        statusCode: 200,
        data: result.data,
      });
    } catch (error) {
      log(error);
      return error;
    }
  }

  static async addImages(imageIds: string[], userId: string) {
    let imageData;

    try {
      if (imageIds.length > 10) {
        throw new Error('Big amount of images, must be at least 10');
      }

      for (const imageId of imageIds) {
        imageData = await this.fetchAndSaveImageToS3(imageId);
        imageData.userId = userId;

        await this.insertImageDataToDynamo(imageData);
      }

      log(JSON.stringify({ message: 'Images added successfully' }));

      return JSON.stringify({
        statusCode: 200,
        body: { message: 'Images added successfully' },
      });
    } catch (error) {
      return {
        statusCode: 422,
        body: JSON.stringify({ errors: { file: error.message } }),
      };
    }
  }

  static async triggerResizeImage(records) {
    const width = 250;
    const height = 512;

    for (const record of records) {
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
  }

  static async fetchAndSaveImageToS3(imageId: string) {
    const apiUrl = `https://api.unsplash.com/photos/${imageId}?client_id=${process.env.UNSPLASH_ACCESS_KEY}`;
    const bucketName = process.env.IMAGES_BUCKET_NAME;
    const key = uuidv4();

    const response = await axios.get(apiUrl);

    const highQualityImageUrl = response.data.urls.full;

    const imageResponse = await axios.get(highQualityImageUrl, {
      responseType: 'arraybuffer',
    });

    const fileExtension = this.makeExtensioFromContentType(imageResponse.headers['content-type'] as string);

    if (fileExtension === 'unknown') {
      throw new Error('Unsupported image extension');
    }

    const imageBuffer = Buffer.from(imageResponse.data);

    const s3Params = {
      Bucket: bucketName,
      Key: `uploads/${key}.${fileExtension}`,
      Body: imageBuffer,
    };

    const putObjectCommand = new PutObjectCommand(s3Params);

    await s3Client.send(putObjectCommand);

    const imageData = {
      path: `${bucketName}/uploads/${key}.${fileExtension}`,
      id: key,
    };

    return imageData;
  }

  static async insertImageDataToDynamo({ path, userId, id }: ImageData) {
    const imageItem = {
      TableName: TABLES.USERS_TEST,
      Item: {
        path: { S: path },
        email: { S: userId },
        id: { S: id },
      },
    };

    await dynamoDbClient.send(new PutItemCommand(imageItem));
  }

  static makeExtensioFromContentType(contentType: string) {
    switch (contentType) {
      case 'image/jpeg':
        return 'jpg';
      case 'image/png':
        return 'png';

      default:
        return 'unknown';
    }
  }
}
