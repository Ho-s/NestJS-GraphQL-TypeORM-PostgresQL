import { HttpStatus, Logger } from '@nestjs/common';

import { GraphQLError } from 'graphql';

import { PRESERVED_STATUS_CODES } from './exception.constant';
import {
  isBaseException,
  isGraphqlOriginalError,
  isHttpException,
} from './exception.util';

const logger = new Logger('GraphqlError');

const determineErrorCondition = (error: GraphQLError) => {
  if (isGraphqlOriginalError(error.extensions)) {
    return {
      errorStatus: HttpStatus.BAD_REQUEST,
      errorCode: error.extensions.code || 'BAD_REQUEST',
    };
  }

  if (isBaseException(error.originalError)) {
    return {
      errorStatus: error.originalError.statusCode,
      errorCode: error.originalError.code,
    };
  }

  return {
    errorStatus: HttpStatus.INTERNAL_SERVER_ERROR,
    errorCode: 'INTERNAL_SERVER_ERROR',
  };
};

const determineHttpStatus = (
  graphqlError: GraphQLError,
  errorStatus: HttpStatus,
): HttpStatus => {
  if (isGraphqlOriginalError(graphqlError.extensions)) {
    return HttpStatus.BAD_REQUEST;
  }

  if (isHttpException(graphqlError.originalError)) {
    const originalStatus = graphqlError.originalError.getStatus();
    if (PRESERVED_STATUS_CODES.includes(originalStatus)) {
      return originalStatus;
    }
  }

  if (errorStatus === HttpStatus.INTERNAL_SERVER_ERROR) {
    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  return HttpStatus.OK;
};

const logError = (error: GraphQLError): void => {
  logger.error({
    message: error.message,
    originalError: error.originalError,
    path: error.path,
    locations: error.locations,
  });
};

const handleInternalServerError = (
  errorStatus: HttpStatus,
  _: GraphQLError,
): void => {
  if (errorStatus === HttpStatus.INTERNAL_SERVER_ERROR) {
    /**
     * @TODO
     * Implement sentry like monitoring tools
     */
  }
};

const formatError = (
  error: GraphQLError,
  options: {
    setHttpStatus: (status: HttpStatus) => void;
    logError: () => void;
    captureUnexpectedException: () => void;
  },
) => {
  const { errorStatus, errorCode } = determineErrorCondition(error);

  options.logError();

  if (errorStatus === HttpStatus.INTERNAL_SERVER_ERROR) {
    options.captureUnexpectedException();
  }

  const httpStatus = determineHttpStatus(error, errorStatus);
  options.setHttpStatus(httpStatus);

  return {
    message: error.message,
    locations: error.locations,
    path: error.path,
    extensions: {
      errorStatus,
      errorCode,
      ...error.extensions,
    },
  };
};

export const errorFormatter = (
  errors: ReadonlyArray<GraphQLError>,
  originalData: Record<string, unknown>,
) => {
  let statusCode = HttpStatus.OK;

  const formattedErrors = errors.map((error) =>
    formatError(error, {
      setHttpStatus: (status) => {
        if (status !== HttpStatus.OK) {
          statusCode = status;
        }
      },
      logError: () => logError(error),
      captureUnexpectedException: () =>
        handleInternalServerError(HttpStatus.INTERNAL_SERVER_ERROR, error),
    }),
  );

  return {
    statusCode,
    response: {
      data: statusCode === HttpStatus.OK ? originalData : null,
      errors: formattedErrors,
    },
  };
};
