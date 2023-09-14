import { APIGatewayAuthorizerResult } from 'aws-lambda';
import { verifyToken } from '@helper/auth/verify-token';
import { log } from '@helper/logger';

export const handler = (event, _, callback) => {
  try {
    const token = event.headers.authorization.split(' ')[1];
    const decoded = verifyToken(token);

    const currentTimeInSeconds = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < currentTimeInSeconds) {
      throw new Error();
    }

    const principalId = decoded.userId;
    const policy = generatePolicy(principalId, 'Allow', '*', { userId: decoded.userId });
    return callback(null, policy);
  } catch (error) {
    log.error(JSON.stringify(error));
    return callback('Unauthorized');
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
