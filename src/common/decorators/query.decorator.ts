import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { parse, print } from 'graphql';

export const CurrentQuery = createParamDecorator<string[]>(
  (_, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    const { fieldName, path } = context.getArgs()[3];

    const query = ctx.getContext().req.body.query;
    const operationJson = print(parse(query));
    const operationArray = operationJson.split('\n');

    operationArray.shift();
    operationArray.pop();

    const firstLineFinder = operationArray.findIndex((v) =>
      v.includes(fieldName === path.key ? fieldName : path.key + ':'),
    );

    operationArray.splice(0, firstLineFinder);

    const stack = [];

    let depth = 0;

    for (const line of operationArray) {
      stack.push(line);
      if (line.includes('{')) {
        depth++;
      } else if (line.includes('}')) {
        depth--;
      }

      if (depth === 0) {
        break;
      }
    }

    return stack.join('\n');
  },
);
