import { dynamoDbClient } from '@services/dynamodb';
import { PutItemCommand, GetItemCommand } from '@aws-sdk/client-dynamodb';
import * as bcrypt from 'bcryptjs';
import { AuthValidatorService } from './auth-validator.service';
import { log } from '@helper/logger';
import { isObjectEmpty } from '@helper/object/isEmpty';
import { APIGatewayProxyResult } from 'aws-lambda';
import { generateToken } from '@helper/auth/generate-token';

export class AuthService {
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

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(body.password, saltRounds);

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

  static async signin(body: { email: string; password: string }): Promise<APIGatewayProxyResult> {
    const emailValidationResult = AuthValidatorService.validateEmail(body.email);

    if (emailValidationResult.error) {
      return {
        statusCode: 401,
        body: JSON.stringify({ errors: { email: emailValidationResult.error.message } }),
      };
    }

    const getItemCommand = new GetItemCommand({
      TableName: 'Users',
      Key: {
        email: { S: body.email },
      },
    });

    try {
      const { Item: user } = await dynamoDbClient.send(getItemCommand);

      if (!user) {
        return {
          statusCode: 401,
          body: JSON.stringify({ message: 'User not found' }),
        };
      }

      const isPasswordValid = await bcrypt.compare(body.password, user.hashedPasswords.S as string);

      if (!isPasswordValid) {
        return {
          statusCode: 401,
          body: JSON.stringify({ message: 'Incorrect password' }),
        };
      }

      const token = generateToken(body.email);

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
