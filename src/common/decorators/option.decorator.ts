import {
  ExecutionContext,
  InternalServerErrorException,
  createParamDecorator,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { parse, print } from 'graphql';
import { Repository } from 'typeorm';

import { set } from '../graphql/utils/processWhere';
import {
  AddKeyValueInObjectProps,
  GetInfoFromQueryProps,
} from '../graphql/utils/types';

const DATA = 'data';

const addKeyValuesInObject = <Entity>({
  stack,
  relations,
  select,
  expandRelation,
  hasCountType,
}: AddKeyValueInObjectProps<Entity>): GetInfoFromQueryProps<Entity> => {
  if (stack.length) {
    let stackToString = stack.join('.');

    if (hasCountType) {
      if (stack[0] !== DATA || (stack.length === 1 && stack[0] === DATA)) {
        return { relations, select };
      }
      stackToString = stackToString.replace(`${DATA}.`, '');
    }

    if (expandRelation) {
      set(relations, stackToString, true);
    }

    set(select, stackToString, true);
  }

  return { relations, select };
};

export function getOptionFromGqlQuery<Entity>(
  this: Repository<Entity>,
  query: string,
  hasCountType?: boolean,
): GetInfoFromQueryProps<Entity> {
  const splitted = query.split('\n');

  // Remove alias
  splitted.shift();
  splitted.pop();

  const stack = [];

  const regex = /[\s\{]/g;
  let lastMetadata = this.metadata;

  return splitted.reduce(
    (acc, line) => {
      const replacedLine = line.replace(regex, '');

      if (line.includes('{')) {
        stack.push(replacedLine);
        const isFirstLineDataType = hasCountType && replacedLine === DATA;

        if (!isFirstLineDataType) {
          lastMetadata = lastMetadata.relations.find(
            (v) => v.propertyName === replacedLine,
          ).inverseEntityMetadata;
        }

        return addKeyValuesInObject({
          stack,
          relations: acc.relations,
          select: acc.select,
          expandRelation: true,
          hasCountType,
        });
      } else if (line.includes('}')) {
        const hasDataTypeInStack =
          hasCountType && stack.length && stack[0] === DATA;

        lastMetadata =
          stack.length < (hasDataTypeInStack ? 3 : 2)
            ? this.metadata
            : lastMetadata.relations.find(
                (v) => v.propertyName === stack[stack.length - 2],
              ).inverseEntityMetadata;

        stack.pop();

        return acc;
      }

      const addedStack = [...stack, replacedLine];

      if (
        ![...lastMetadata.columns, ...lastMetadata.relations]
          .map((v) => v.propertyName)
          .includes(addedStack[addedStack.length - 1])
      ) {
        return acc;
      }

      return addKeyValuesInObject({
        stack: addedStack,
        relations: acc.relations,
        select: acc.select,
        hasCountType,
      });
    },
    {
      relations: {},
      select: {},
    },
  );
}

export const getCurrentGraphQLQuery = (ctx: GqlExecutionContext) => {
  const { fieldName, path } = ctx.getArgByIndex(3) as {
    fieldName: string;
    path: { key: string };
  };

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
};

export const GraphQLQueryToOption = <T>(hasCountType?: boolean) =>
  createParamDecorator((_: unknown, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    const query = getCurrentGraphQLQuery(ctx);
    const repository: Repository<T> = request.repository;

    if (!repository) {
      throw new InternalServerErrorException(
        "Repository not found in request, don't forget to use UseRepositoryInterceptor",
      );
    }

    const queryOption: GetInfoFromQueryProps<T> = getOptionFromGqlQuery.call(
      repository,
      query,
      hasCountType,
    );

    return queryOption;
  })();
