import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { AuthService } from '../services/auth.service';

export const handler = (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
  const requestBody = JSON.parse(event.body || '');

  return AuthService.signup(requestBody);
};
