import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ImageService } from '../services/image.service';

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
  const imageIds: string[] = JSON.parse(event.body || '').imageIds;

  return ImageService.addImages(imageIds);
};
