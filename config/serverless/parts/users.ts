import { AWSPartitial } from '../types';

export const usersConfig: AWSPartitial = {
  provider: {
    httpApi: {
      authorizers: {
        customAuthorizer: {
          type: 'request',
          functionName: 'customAuthorizer',
        },
      },
    },
    iam: {
      role: {
        statements: [
          {
            Effect: 'Allow',
            Action: [
              'dynamodb:DescribeTable',
              'dynamodb:Query',
              'dynamodb:Scan',
              'dynamodb:GetItem',
              'dynamodb:PutItem',
              'dynamodb:DeleteItem',
              'dynamodb:UpdateItem',
              'dynamodb:BatchGetItem',
              'dynamodb:BatchWriteItem',
            ],
            Resource: ['arn:aws:dynamodb:*:*:table/UsersTest', 'arn:aws:dynamodb:*:*:table/UsersTest/index/EmailIndex'],
          },
        ],
      },
    },
  },

  functions: {
    signup: {
      handler: 'api/users/lambdas/sign-up.handler',
      memorySize: 128,
      events: [
        {
          httpApi: {
            path: '/signup',
            method: 'post',
          },
        },
      ],
    },
    signin: {
      handler: 'api/users/lambdas/sign-in.handler',
      memorySize: 128,
      events: [
        {
          httpApi: {
            path: '/signin',
            method: 'post',
          },
        },
      ],
    },
    test: {
      handler: 'api/users/lambdas/test-authorizer.handler',
      memorySize: 128,
      events: [
        {
          httpApi: {
            path: '/test',
            method: 'post',
            authorizer: {
              name: 'customAuthorizer',
            },
          },
        },
      ],
    },
    customAuthorizer: {
      handler: 'api/users/lambdas/authorizer-func.handler',
      description: '${self:service} authorizer',
      memorySize: 128,
    },
  },
  resources: {
    Resources: {
      usersTable: {
        Type: 'AWS::DynamoDB::Table',
        Properties: {
          TableName: 'UsersTest',
          AttributeDefinitions: [
            {
              AttributeName: 'id',
              AttributeType: 'S',
            },
            {
              AttributeName: 'email',
              AttributeType: 'S',
            },
          ],
          KeySchema: [
            {
              AttributeName: 'id',
              KeyType: 'HASH',
            },
          ],
          ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1,
          },
          GlobalSecondaryIndexes: [
            {
              IndexName: 'EmailIndex',
              KeySchema: [
                {
                  AttributeName: 'email',
                  KeyType: 'HASH',
                },
              ],
              Projection: {
                ProjectionType: 'ALL',
              },
              ProvisionedThroughput: {
                ReadCapacityUnits: 1,
                WriteCapacityUnits: 1,
              },
            },
          ],
        },
      },
    },
  },
};
