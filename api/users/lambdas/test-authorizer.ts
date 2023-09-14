import { APIGatewayProxyResult } from 'aws-lambda';

export const handler = async (event: any, context): Promise<APIGatewayProxyResult> => {
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'Function is got', context, event }),
  };
};
