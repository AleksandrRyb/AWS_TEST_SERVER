import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ImageService } from '../services/image.service';
import { log } from '@helper/logger';

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
  const query = event.queryStringParameters?.query;

  return ImageService.findImage(query);
};
