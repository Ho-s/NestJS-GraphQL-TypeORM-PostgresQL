import { BadRequestException } from '@nestjs/common';
import { isPlainObject, isArray, omit, merge, set } from 'lodash';
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

// equal
// where:{user:{id:3}}

// Not equal
//where:{user:{id:{$ne:3}}}
type TNe = {
  $ne: unknown;
};

// Less than
//where:{user:{id:{$lt:3}}}
type TLt = {
  $lt: number | Date;
};

// Less than or equal
//where:{user:{id:{$lte:3}}}
type TLte = {
  $lte: number | Date;
};

// Greater than
//where:{user:{id:{$gt:3}}}
type TGt = {
  $gt: number | Date;
};

// Greater than or equal
//where:{user:{id:{$gte:3}}}
type TGte = {
  $gte: number | Date;
};

// In
//where:{user:{id:{$in:[1,2,3]}}}
type TIn<T> = {
  $in: T[keyof T][];
};

// Not in
//where:{user:{id:{$nIn:[1,2,3]}}}
type TNotIn = {
  $nIn: unknown[];
};

// Contains(Case-sensitive)
//where:{user:{id:{$contains:"3"}}}
type TContains = {
  $contains: string | number;
};

// Not contains(Case-sensitive)
//where:{user:{id:{$nContains:"3"}}}
type TNotContains = {
  $nContains: unknown;
};

// Contains(Case-insensitive)
//where:{user:{id:{$icontains:"3"}}}
type TIContains = {
  $iContains: string | number;
};

// Not contains(Case-insensitive)
//where:{user:{id:{$icontains:"3"}}}
type TNotIContains = {
  $nIContains: unknown;
};

// Is null
//where:{user:{id:{$null:true}}}
type TNull = {
  $null: boolean;
};

// Is not null
//where:{user:{id:{$notNull:true}}}
type TNotNull = {
  $nNull: boolean;
};

// Is between
//where:{user:{id:{$between:[1,3]}}}
type TBetween = {
  $between: [number, number] | [Date, Date];
};

// Joins the filters in an "or" expression
// where:[{user:{id:3}},{user:{id:4}}]

// Joins the filters in an "and" expression
// where:{user:{id:3,name:"test"},tile:{id:4}}

export type OperatorType<T> =
  | TNe
  | TLt
  | TLte
  | TGt
  | TGte
  | TIn<T>
  | TNotIn
  | TContains
  | TNotContains
  | TNull
  | TNotNull
  | TBetween
  | TIContains
  | TNotIContains;

type FindOptionWhereExtendedByOperatorType<T> =
  | FindOptionsWhere<T>
  | {
      [key in keyof T]?:
        | FindOptionWhereExtendedByOperatorType<T>
        | OperatorType<T>
        | T[key];
    };

export type IWhere<T> =
  | FindOptionWhereExtendedByOperatorType<T>[]
  | FindOptionWhereExtendedByOperatorType<T>;

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

  return operatorObject[key];
}

export function processWhere<T>(
  original: IWhere<T>,
): FindOptionsWhere<T> | FindOptionsWhere<T>[] {
  function goDeep<T>(
    filters: IWhere<T>,
    keyStore: string[] = [],
    _original: IWhere<T>,
  ) {
    // Check if "and" expression
    if (isPlainObject(filters) && Object.keys(filters).length > 1) {
      const array = Object.entries(filters).map(([key, value]) =>
        goDeep(
          { [key]: value } as any,
          keyStore,
          omit(_original, key) as IWhere<T>,
        ),
      );

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
    keyStore.push(thisKey);

    // In case object is plain and need to go deep
    return goDeep(nextObject, keyStore, _original);
  }

  // Check if "or" expression
  if (isArray(original)) {
    return original.map((where, i) => goDeep(where, [], original[i]));
  }

  return goDeep(original, [], original);
}
