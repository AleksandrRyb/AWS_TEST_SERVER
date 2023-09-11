import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { SignupService } from '../services/users.service';

export const handler = (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
  const requestBody = JSON.parse(event.body || '');

  return SignupService.signup(requestBody);
};
