import { FindOptionsOrder } from 'typeorm';
import { IPagination } from './inputs/custom.input';
import { IWhere } from './utils/types';

export const valueObj = {
  ASC: 'ASC',
  DESC: 'DESC',
  asc: 'asc',
  desc: 'desc',
  1: 1,
  '-1': -1,
} as const;

const direction = ['ASC', 'DESC', 'asc', 'desc'] as const;
type DirectionUnion = typeof direction[number];

const nulls = ['first', 'last', 'FIRST', 'LAST'] as const;
type NullsUnion = typeof nulls[number];

export const checkObject = {
  direction,
  nulls,
};

export const directionObj = {
  direction: 'direction',
  nulls: 'nulls',
} as const;

type IDirectionWitnNulls = {
  [directionObj.direction]?: DirectionUnion;
  [directionObj.nulls]?: NullsUnion;
};

export type IDriection = typeof valueObj[keyof typeof valueObj];
export type ISort = IDriection | IDirectionWitnNulls;

export type IDataType = 'count' | 'data' | 'all';

export type IRelation<T> = (keyof T)[];

export interface IGetData<T> {
  data?: T[];
  count?: number;
}

export interface RepoQuery<T> {
  pagination?: IPagination;
  where?: IWhere<T>;
  order?: FindOptionsOrder<T>;
  relations?: IRelation<T>;
  dataType?: IDataType;
}

export type OneRepoQuery<T> = Pick<RepoQuery<T>, 'where' | 'relations'>;
