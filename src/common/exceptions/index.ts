import { HttpStatus } from '@nestjs/common';

import { createException } from './exception.factory';

const CustomException = createException();

export class CustomConflictException extends CustomException(
  HttpStatus.CONFLICT,
  '{{property}} already exists',
  'CONFLICT',
) {}

export class CustomBadRequestException extends CustomException(
  HttpStatus.BAD_REQUEST,
  '{{message}}',
  'BAD_REQUEST',
) {}

export class CustomUnauthorizedException extends CustomException(
  HttpStatus.UNAUTHORIZED,
  '{{message}}',
  'UNAUTHORIZED',
) {}
