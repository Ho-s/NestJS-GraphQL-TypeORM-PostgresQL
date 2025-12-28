import { HttpException, HttpStatus } from '@nestjs/common';

import { GraphQLErrorExtensions } from 'graphql';

import { GRAPHQL_ERROR_CODES } from './exception.constant';
import { BaseException } from './exception.factory';

export const isGraphqlOriginalError = (
  extensions: GraphQLErrorExtensions,
): boolean => {
  return (
    typeof extensions?.code === 'string' &&
    GRAPHQL_ERROR_CODES.includes(extensions.code)
  );
};

export const isBaseException = (
  error: unknown,
): error is BaseException<number, string, string> => {
  return error instanceof BaseException;
};

export const isHttpException = (error: unknown): error is HttpException => {
  return error instanceof HttpException;
};

export const getHttpExceptionCode = (status: number): string => {
  return HttpStatus[status] || 'HTTP_ERROR';
};

export const getHttpExceptionMessage = (error: HttpException): string => {
  const response = error.getResponse();

  if (typeof response === 'string') {
    return response;
  }

  if (typeof response === 'object' && response !== null) {
    const { message } = response as { message?: string | string[] };

    if (Array.isArray(message)) {
      return message.join(', ');
    }

    if (typeof message === 'string') {
      return message;
    }
  }

  return error.message;
};
