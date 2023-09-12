import { APIGatewayAuthorizerResult } from 'aws-lambda';
import { verifyToken } from '@helper/auth/verify-token';

export const handler = async (event) => {
  const token = event.headers.authorization.split(' ')[1];

  try {
    const decoded = verifyToken(token);

    const currentTimeInSeconds = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < currentTimeInSeconds) {
      return generateUnauthorizedResponse('Token expired');
    }

    const principalId = decoded.email;
    const policy = generatePolicy(principalId, 'Allow', '*', {});
    return policy;
  } catch (error) {
    return generateUnauthorizedResponse('Unauthorized');
  }
};

function generatePolicy<C extends APIGatewayAuthorizerResult['context']>(
  principalId: string,
  effect: 'Allow' | 'Deny',
  resource: string,
  context: C
): APIGatewayAuthorizerResult & { context: C } {
  const authResponse: APIGatewayAuthorizerResult & { context: C } = {
    principalId,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: effect,
          Resource: resource,
        },
      ],
    },
    context,
  };

  return authResponse;
}

const generateUnauthorizedResponse = async (message) => {
  return {
    statusCode: 401,
    body: JSON.stringify(message),
  };
};
