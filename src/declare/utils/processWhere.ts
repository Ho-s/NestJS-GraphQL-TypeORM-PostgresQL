import { BadRequestException } from '@nestjs/common';
import { isPlainObject, isArray, merge, set } from 'lodash';
import {
  Between,
  In,
  IsNull,
  LessThan,
  ILike,
  LessThanOrEqual,
  Like,
  MoreThan,
  MoreThanOrEqual,
  Not,
  FindOptionsWhere,
} from 'typeorm';
import { IWhere, OperatorType } from './types';

function processOperator<T>(prevKey: string, nextObject: OperatorType<T>) {
  const key = Object.keys(nextObject)[0];
  const value = nextObject[key];
  const operatorObject = {
    $eq: { [prevKey]: value },
    $ne: { [prevKey]: Not(value) },
    $lt: { [prevKey]: LessThan(value) },
    $lte: { [prevKey]: LessThanOrEqual(value) },
    $gt: { [prevKey]: MoreThan(value) },
    $gte: { [prevKey]: MoreThanOrEqual(value) },
    $in: { [prevKey]: In(value) },
    $nIn: { [prevKey]: Not(In(value)) },
    $contains: { [prevKey]: Like(`%${value}%`) },
    $nContains: { [prevKey]: Not(Like(`%${value}%`)) },
    $iContains: { [prevKey]: ILike(`%${value}%`) },
    $nIContains: { [prevKey]: Not(ILike(`%${value}%`)) },
    $null: { [prevKey]: IsNull() },
    $nNull: { [prevKey]: Not(IsNull()) },
    $between: { [prevKey]: Between(value[0], value[1]) },
  };

  if (key.includes('$') && !(key in operatorObject)) {
    throw new BadRequestException(`Invalid operator ${key} for ${prevKey}`);
  }

  if (key in operatorObject) {
    return operatorObject[key];
  }

  return { [prevKey]: nextObject };
}

function goDeep<T>(
  filters: IWhere<T>,
  keyStore: string[] = [],
  _original: IWhere<T>,
) {
  // Check if "and" expression
  if (isPlainObject(filters) && Object.keys(filters).length > 1) {
    const array = Object.entries(filters).map(([key, value]) => {
      return goDeep({ [key]: value } as any, keyStore, {});
    });

    return array.reduce(
      (prev: Record<string, unknown>, next: Record<string, unknown>) => {
        return merge(prev, next);
      },
      {},
    );
  }

  const thisKey = Object.keys(filters)[0];
  let nextObject = filters[Object.keys(filters)[0]];

  // Check if this item is on bottom
  if (!isPlainObject(nextObject)) {
    // In case use null as value
    if (nextObject === null) {
      return { [thisKey]: IsNull() };
    }

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
