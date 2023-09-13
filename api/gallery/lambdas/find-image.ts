import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';

export const handler = (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
  const requestBody = JSON.parse(event.body || '');
};
