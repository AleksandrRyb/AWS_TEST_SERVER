import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ImageService } from '../services/image.service';

export const handler = async (event: APIGatewayEvent): Promise<any> => {
  const imageIds: string[] = JSON.parse(event.body || '').imageIds;
  const email = event.requestContext.authorizer?.lambda.email;

  return ImageService.addImages(imageIds, email);
};
