import { PutItemCommand, GetItemCommand, QueryCommand, QueryOutput } from '@aws-sdk/client-dynamodb';
import { APIGatewayProxyResult } from 'aws-lambda';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { dynamoDbClient } from '@services/dynamodb';
import { AuthValidatorService } from './auth-validator.service';
import { isObjectEmpty } from '@helper/object/isEmpty';
import { generateToken } from '@helper/auth/generate-token';

export class AuthService {
  static async signup(body: { email: string; password: string }): Promise<APIGatewayProxyResult> {
    const errors = AuthValidatorService.validateSignup(body);
    const userId = uuidv4();

    if (!isObjectEmpty(errors)) {
      return {
        statusCode: 401,
        body: JSON.stringify({ errors }),
      };
    }

    const queryParams = {
      TableName: 'UsersTest',
      IndexName: 'EmailIndex',
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': { S: body.email },
      },
    };

    const queryCommand = new QueryCommand(queryParams);

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(body.password, saltRounds);

    const putItemCommand = new PutItemCommand({
      TableName: 'UsersTest',
      Item: {
        id: { S: userId },
        email: { S: body.email },
        hashedPasswords: { S: hashedPassword },
      },
    });

    try {
      const users = await dynamoDbClient.send(queryCommand);

      if (users.Items && users.Items.length > 0) {
        return {
          statusCode: 401,
          body: JSON.stringify({ errors: { user: 'User with given email is existed' } }),
        };
      }

      await dynamoDbClient.send(putItemCommand);

      return {
        statusCode: 200,
        body: JSON.stringify({
          message: 'User created successfully',
        }),
      };
    } catch (error) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: 'Error creating user', error: error.message }),
      };
    }
  }

  static async signin(body: { email: string; password: string }): Promise<APIGatewayProxyResult> {
    const emailValidationResult = AuthValidatorService.validateEmail(body.email);

    if (emailValidationResult.error) {
      return {
        statusCode: 401,
        body: JSON.stringify({ errors: { email: emailValidationResult.error.message } }),
      };
    }

    const queryParams = {
      TableName: 'UsersTest',
      IndexName: 'EmailIndex',
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': { S: body.email },
      },
    };

    const queryCommand = new QueryCommand(queryParams);

    try {
      const foundUsers = await dynamoDbClient.send(queryCommand);
      if (foundUsers.Items && foundUsers.Items.length < 1) {
        return {
          statusCode: 401,
          body: JSON.stringify({ message: 'User not found' }),
        };
      }

      const user = foundUsers.Items && foundUsers.Items[0];

      const isPasswordValid = await bcrypt.compare(body.password, user?.hashedPasswords.S as string);

      if (!isPasswordValid) {
        return {
          statusCode: 401,
          body: JSON.stringify({ message: 'Incorrect password' }),
        };
      }

      const token = generateToken({ userId: user?.id.S });

      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Authentication successful', token }),
      };
    } catch (error) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: 'Authentication failed', error }),
      };
    }
  }
}
