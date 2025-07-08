import {
  ApolloServerPlugin,
  BaseContext,
  GraphQLRequestContext,
} from '@apollo/server';

import { errorFormatter } from './exception.format';

export const httpStatusPlugin: ApolloServerPlugin = {
  async requestDidStart() {
    return {
      async willSendResponse(
        requestContext: GraphQLRequestContext<BaseContext>,
      ) {
        const { response, errors } = requestContext;

        if (!errors || errors.length === 0) {
          return;
        }

        const { statusCode, response: formattedResponse } = errorFormatter(
          errors,
          response.body.kind === 'single'
            ? response.body.singleResult.data
            : null,
        );

        response.body = {
          kind: 'single',
          singleResult: formattedResponse,
        };
        response.http.status = statusCode;
      },
    };
  },
};
