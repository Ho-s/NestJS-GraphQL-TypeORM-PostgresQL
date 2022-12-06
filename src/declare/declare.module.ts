import { BadRequestException, Module } from '@nestjs/common';
import { isEmpty } from 'lodash';
import { IWhere, processWhere } from '../util/processWhere';
import {
  FindManyOptions,
  FindOneOptions,
  FindOptionsOrder,
  FindOptionsRelations,
} from 'typeorm';
import { Repository } from 'typeorm/repository/Repository';
import { isObject } from 'src/util/isObject';
import { IPagination } from 'src/entities';

const valueObj = {
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

const checkObject = {
  direction,
  nulls,
};

const directionObj = {
  direction: 'direction',
  nulls: 'nulls',
} as const;

type IDirectionWitnNulls = {
  [directionObj.direction]?: DirectionUnion;
  [directionObj.nulls]?: NullsUnion;
};

type IDriection = typeof valueObj[keyof typeof valueObj];
type ISort = IDriection | IDirectionWitnNulls;

export type IDataType = 'count' | 'data' | 'all';

export type IRelation<T> = (keyof T)[];

export interface RepoQuery<T> {
  pagination?: IPagination;
  where?: IWhere<T>;
  order?: FindOptionsOrder<T>;
  relations?: IRelation<T>;
  dataType?: IDataType;
}

export interface IGetData<T> {
  data?: T[];
  count?: number;
}

export type OneRepoQuery<T> = Pick<RepoQuery<T>, 'where' | 'relations'>;

declare module 'typeorm/repository/Repository' {
  interface Repository<Entity> {
    getMany(
      this: Repository<Entity>,
      qs: RepoQuery<Entity>,
    ): Promise<IGetData<Entity>>;
    getOne(this: Repository<Entity>, qs: OneRepoQuery<Entity>): Promise<Entity>;
  }
}

function filterOrder<T>(order: FindOptionsOrder<T>) {
  Object.entries(order).forEach(([key, value]: [string, ISort]) => {
    if (!(key in this.metadata.propertiesMap)) {
      throw new BadRequestException(
        `Order key ${key} is not in ${this.metadata.name}`,
      );
    }

    if (isObject(value)) {
      Object.entries(value).forEach(([_key, _value]) => {
        if (!directionObj[_key]) {
          throw new BadRequestException(
            `Order must be ${Object.keys(directionObj).join(' or ')}`,
          );
        }
        if (!checkObject[_key].includes(_value as unknown)) {
          throw new BadRequestException(
            `Order ${_key} must be ${checkObject[_key].join(' or ')}`,
          );
        }
      });
    } else {
      if (!valueObj[value as IDriection]) {
        throw new BadRequestException(
          `Order must be ${Object.keys(valueObj).join(' or ')}`,
        );
      }
    }
  });
}

@Module({})
export class DeclareModule {
  constructor() {
    this.call();
  }
  call() {
    Repository.prototype.getMany = async function <T>(
      this: Repository<T>,
      { pagination, where, order, relations, dataType = 'all' }: RepoQuery<T>,
    ): Promise<IGetData<T>> {
      // You can remark these lines(if order {}) if you don't want to use strict order roles
      if (order) {
        filterOrder.call(this, order);
      }

      const condition: FindManyOptions<T> = {
        ...(relations && {
          relations: relations as unknown as FindOptionsRelations<T>,
        }),
        ...(where && !isEmpty(where) && { where: processWhere(where) }),
        ...(order && { order }),
        ...(pagination && {
          skip: pagination.page * pagination.size,
          take: pagination.size,
        }),
      };

      const returns = {
        data: async () => ({ data: await this.find(condition) }),
        count: async () => ({ count: await this.count(condition) }),
        all: async () => {
          const res = await this.findAndCount(condition);
          return { data: res[0], count: res[1] };
        },
      };

      return returns[dataType]();
    };

    Repository.prototype.getOne = async function <T>(
      this: Repository<T>,
      { where, relations }: OneRepoQuery<T>,
    ): Promise<T> {
      const condition: FindOneOptions<T> = {
        ...(relations && {
          relations: relations as unknown as FindOptionsRelations<T>,
        }),
        ...(where && { where: processWhere(where) }),
      };

      return this.findOne(condition);
    };
  }
}
