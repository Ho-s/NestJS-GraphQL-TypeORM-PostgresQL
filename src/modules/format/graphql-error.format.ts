import { GraphQLError, GraphQLFormattedError } from 'graphql';

export const formatError = (error: GraphQLError) => {
  const extensions: any = error.extensions;
  const standardError: GraphQLFormattedError = {
    message: error.extensions?.message || error.message,
    ...error,
    extensions: {
      __orginal: {
        ...extensions,
      },
      code: error.extensions?.code || 'UNKNOWN ERROR',
      message: error.extensions?.message || error.message,
    },
  };
  // HTTP Exception
  if (extensions?.exception) {
    standardError.extensions.message = extensions.exception.message;
    standardError.extensions.status = extensions.exception.status;
  }
  // Class vaildation Exception
  if (extensions?.response) {
    standardError.extensions.message = extensions.response.message;
    standardError.extensions.status = extensions.response.statusCode;
  }
  return standardError;
};
