import * as Joi from 'joi';

interface Errors {
  [key: string]: Joi.ValidationErrorItem['message'];
}
export class AuthValidatorService {
  static validateSignup(body: { email: string; password: string }): Errors {
    const errors: Errors = {};

    const passwordValidationError = this.validatePassword(body.password).error;
    if (passwordValidationError) {
      errors.password = passwordValidationError.details[0].message;
    }

    const emailValidationError = this.validateEmail(body.email).error;
    if (emailValidationError) {
      errors.email = emailValidationError.details[0].message;
    }

    return errors;
  }

  static validateEmail(email: string): Joi.ValidationResult {
    const emailValidationResult = Joi.string()
      .email({ tlds: { allow: false } })
      .message('Email must be a valid email address')
      .validate(email);

    return emailValidationResult;
  }

  static validatePassword(password: string): Joi.ValidationResult {
    const passwordValidationResult = Joi.string()
      .min(8)
      .max(16)
      .regex(/^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/, 'password')
      .message(
        'Password must be between 8 and 16 characters and contain at least one uppercase letter, one number, and one special symbol (!@#$%^&*)'
      )
      .validate(password);

    return passwordValidationResult;
  }
}
