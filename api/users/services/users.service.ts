import { dynamoDbClient } from '@services/dynamodb';
import { PutItemCommand, GetItemCommand } from '@aws-sdk/client-dynamodb';
import { hashPassword } from '@helper/auth/hash-password';
import { AuthValidatorService } from './auth-validator.service';
import { log } from '@helper/logger';
import { isObjectEmpty } from '@helper/object/isEmpty';
import { APIGatewayProxyResult } from 'aws-lambda';

export class SignupService {
  static async signup(body: { email: string; password: string }): Promise<APIGatewayProxyResult> {
    const errors = AuthValidatorService.validateSignup(body);

    if (!isObjectEmpty(errors)) {
      return {
        statusCode: 401,
        body: JSON.stringify({ errors }),
      };
    }

    const getItemCommand = new GetItemCommand({
      TableName: 'Users',
      Key: {
        email: { S: body.email },
      },
    });

    const hashedPassword = hashPassword(body.password);

    const putItemCommand = new PutItemCommand({
      TableName: 'Users',
      Item: {
        email: { S: body.email },
        hashedPasswords: { S: hashedPassword },
      },
    });

    try {
      const { Item: isUserExisted } = await dynamoDbClient.send(getItemCommand);

      log(isUserExisted);

      if (isUserExisted) {
        return {
          statusCode: 401,
          body: JSON.stringify({ errors: { user: 'User with given email is existed' } }),
        };
      }

      await dynamoDbClient.send(putItemCommand);

      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'User created successfully' }),
      };
    } catch (error) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: 'Error creating user', error }),
      };
    }
  }
}
