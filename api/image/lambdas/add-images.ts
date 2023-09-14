import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ImageService } from '../services/image.service';

export const handler = async (event: APIGatewayEvent): Promise<any> => {
  const imageIds: string[] = JSON.parse(event.body || '').imageIds;
  const userId = event.requestContext.authorizer?.lambda.userId;

  return ImageService.addImages(imageIds, userId);
};
