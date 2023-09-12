import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

export const dynamoDbClient = new DynamoDBClient({
  region: 'us-east-1',
});
