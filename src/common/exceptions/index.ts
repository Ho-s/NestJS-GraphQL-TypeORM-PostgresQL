import { HttpStatus } from '@nestjs/common';

import { createException } from './exception.factory';

const CustomException = createException();

export class CustomConflictException extends CustomException(
  HttpStatus.CONFLICT,
  '{{property}} already exists',
  'CONFLICT',
) {}
