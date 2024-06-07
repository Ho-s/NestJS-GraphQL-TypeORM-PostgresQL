import { parse, print } from 'graphql';
import { set } from 'lodash';
import { Repository } from 'typeorm';

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

export function getConditionFromGqlQuery<Entity>(
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
