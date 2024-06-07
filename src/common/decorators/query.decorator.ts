import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { parse, print } from 'graphql';

export const CurrentQuery = createParamDecorator<string[]>(
  (_, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    const { fieldName } = context.getArgs()[3];

    const query = ctx.getContext().req.body.query;
    const operationJson = print(parse(query));
    const operationArray = operationJson.split('\n');

    let depth = -1;
    const operation = operationArray.reduce((acc: string[], cur, _, arr) => {
      if (depth === 0) {
        arr.splice(1); //eject
        return acc;
      }

      if (cur.includes(fieldName)) {
        depth++;
      }

      if (depth < 0) {
        return acc;
      }

      if (cur.includes('{')) {
        depth++;
      }

      if (cur.includes('}')) {
        depth--;
      }

      acc.push(cur);
      return acc;
    }, []);

    return operation.join('\n');
  },
);
