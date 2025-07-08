import { HttpException } from '@nestjs/common';

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
