import { BadRequestException } from '@nestjs/common';

import {
  Between,
  FindOperator,
  FindOptionsWhere,
  ILike,
  In,
  IsNull,
  LessThan,
  LessThanOrEqual,
  Like,
  MoreThan,
  MoreThanOrEqual,
  Not,
} from 'typeorm';

import { IWhere, OperatorType } from './types';

const isArray = (value: unknown): value is unknown[] => {
  return Array.isArray(value);
};

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && !isArray(value) && value !== null;
};

const isMergeable = (value: unknown): value is Record<string, unknown> => {
  return isPlainObject(value) && !(value instanceof FindOperator);
};

const merge = <T, K>(prev: T, next: K): T & K => {
  const merged = { ...prev } as Record<string, unknown>;

  Object.entries(next).forEach(([key, value]) => {
    const current = merged[key];

    merged[key] =
      isMergeable(current) && isMergeable(value)
        ? merge(current, value)
        : value;
  });

  return merged as T & K;
};

export function set<T, K>(object: T, path: string, value: K): T & K {
  const keys = path.split('.');
  const lastKey = keys.pop();

  let target = object;
  for (const key of keys) {
    if (!target[key] || typeof target[key] !== 'object') {
      target[key] = {};
    }
    target = target[key];
  }

  target[lastKey] = value;
  return object as T & K;
}

const isNullish = (value: unknown): value is null | undefined => {
  return value === null || value === undefined;
};

const operatorMap = new Map<string, (value: any) => unknown>([
  ['$eq', (value) => (isNullish(value) ? IsNull() : value)],
  ['$ne', (value) => (isNullish(value) ? Not(IsNull()) : Not(value))],
  ['$lt', (value) => LessThan(value)],
  ['$lte', (value) => LessThanOrEqual(value)],
  ['$gt', (value) => MoreThan(value)],
  ['$gte', (value) => MoreThanOrEqual(value)],
  ['$in', (value) => In(value)],
  ['$nIn', (value) => Not(In(value))],
  ['$contains', (value) => Like(`%${value}%`)],
  ['$nContains', (value) => Not(Like(`%${value}%`))],
  ['$iContains', (value) => ILike(`%${value}%`)],
  ['$nIContains', (value) => Not(ILike(`%${value}%`))],
  ['$null', () => IsNull()],
  ['$nNull', () => Not(IsNull())],
  ['$between', (value) => Between(value[0], value[1])],
]);

const nullSafeOperators = new Set(['$eq', '$ne', '$null', '$nNull']);
const arrayOperators = new Set(['$in', '$nIn']);
const pairOperators = new Set(['$between']);

function assertOperand(prevKey: string, key: string, value: unknown) {
  if (isNullish(value) && !nullSafeOperators.has(key)) {
    throw new BadRequestException(
      `Operator ${key} for ${prevKey} needs a value`,
    );
  }

  if (!arrayOperators.has(key) && !pairOperators.has(key)) {
    return;
  }

  if (!isArray(value) || value.some(isNullish)) {
    throw new BadRequestException(
      `Operator ${key} for ${prevKey} needs an array without null`,
    );
  }

  if (pairOperators.has(key) && value.length !== 2) {
    throw new BadRequestException(
      `Operator ${key} for ${prevKey} needs exactly two values`,
    );
  }
}

function processOperator<T>(prevKey: string, nextObject: OperatorType<T>) {
  const key = Object.keys(nextObject)[0];

  if (key === undefined) {
    throw new BadRequestException(`Empty condition for ${prevKey}`);
  }

  const build = operatorMap.get(key);

  if (!build) {
    if (key.includes('$')) {
      throw new BadRequestException(`Invalid operator ${key} for ${prevKey}`);
    }

    return { [prevKey]: goDeep(nextObject as IWhere<T>, [], {} as IWhere<T>) };
  }

  assertOperand(prevKey, key, nextObject[key]);

  return { [prevKey]: build(nextObject[key]) };
}

function goDeep<T>(
  filters: IWhere<T>,
  keyStore: string[] = [],
  _original: IWhere<T>,
) {
  // Check if "and" expression
  if (isPlainObject(filters) && Object.keys(filters).length > 1) {
    const array = Object.entries(filters).map(([key, value]) => {
      return goDeep({ [key]: value }, keyStore, {});
    });

    return array.reduce(
      (prev: Record<string, unknown>, next: Record<string, unknown>) => {
        return merge(prev, next);
      },
      {},
    );
  }

  const thisKey = Object.keys(filters)[0];

  if (thisKey === undefined) {
    throw new BadRequestException('Where condition must not be empty');
  }

  let nextObject = filters[thisKey];

  // Check if next item is typeorm find operator
  if (nextObject instanceof FindOperator) {
    return { [thisKey]: nextObject };
  }

  // Check if this item is on bottom
  if (!isPlainObject(nextObject)) {
    nextObject = { $eq: nextObject };
  }
  const valueOfNextObjet = Object.values(nextObject)[0];

  // Check if next item is on bottom
  if (
    !isPlainObject(valueOfNextObjet) &&
    !(Object.keys(nextObject).length > 1)
  ) {
    const value = processOperator(thisKey, nextObject);

    if (keyStore.length) {
      set(_original, keyStore.join('.'), value);
      keyStore = [];
      return _original;
    }
    return { ..._original, ...value };
  }

  // In case object is plain and need to go deep
  return goDeep(nextObject, [...keyStore, thisKey], _original);
}

export function processWhere<T>(
  original: IWhere<T>,
): FindOptionsWhere<T> | FindOptionsWhere<T>[] {
  // Check if "or" expression
  if (isArray(original)) {
    return original.map((where, i) => goDeep(where, [], original[i]));
  }

  return goDeep(original, [], original);
}
