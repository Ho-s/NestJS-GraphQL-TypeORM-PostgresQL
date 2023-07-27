import { parse, print } from 'graphql';
import { set } from 'lodash';
import { AddKeyValueInObjectProps, GetInfoFromQueryProps } from './types';

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

export const getInfoFromQuery = <Entity>(
  query: string,
  hasCountType?: boolean,
): GetInfoFromQueryProps<Entity> => {
  const ast = parse(query);
  const operationJson = print(ast);

  const splitted = operationJson.split('\n');

  // Remove first and last braces
  splitted.shift();
  splitted.pop();

  // Remove alias
  splitted.shift();
  splitted.pop();

  const stack = [];

  const regex = /[\s\{]/g;

  return splitted.reduce(
    (acc, line) => {
      const replacedLine = line.replace(regex, '');
      if (line.includes('{')) {
        stack.push(replacedLine);

        return addKeyValuesInObject({
          stack,
          relations: acc.relations,
          select: acc.select,
          expandRelation: true,
          hasCountType,
        });
      } else if (line.includes('}')) {
        stack.pop();

        return acc;
      }

      return addKeyValuesInObject({
        stack: [...stack, replacedLine],
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
};
