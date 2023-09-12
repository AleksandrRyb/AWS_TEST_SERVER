import { APIGatewayProxyResult } from 'aws-lambda';

/**
 * @description This is the controller, or entrypoint for your function.
 */
export const handler = async (event: any): Promise<APIGatewayProxyResult> => {
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'Function is got' }),
  };
};
