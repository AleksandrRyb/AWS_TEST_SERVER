import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ImageService } from '../services/image.service';

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
  const query = event.queryStringParameters?.query;

  return ImageService.findImage(query);
};
