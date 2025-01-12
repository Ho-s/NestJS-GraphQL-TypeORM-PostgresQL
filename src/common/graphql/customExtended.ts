import { BadRequestException } from '@nestjs/common';

import {
  FindManyOptions,
  FindOneOptions,
  FindOptionsOrder,
  Repository,
} from 'typeorm';

import {
  IDriection,
  IGetData,
  ISort,
  OneRepoQuery,
  RepoQuery,
  checkObject,
  directionObj,
  valueObj,
} from './types';
import { processWhere } from './utils/processWhere';

const isObject = (value: unknown): boolean => {
  return typeof value === 'object' && !Array.isArray(value) && value !== null;
};

type EmptyObject<T> = { [K in keyof T]?: never };
type EmptyObjectOf<T> = EmptyObject<T> extends T ? EmptyObject<T> : never;

const isEmptyObject = <T extends object>(
  value: T,
): value is EmptyObjectOf<T> => {
  return Object.keys(value).length === 0;
};

export function filterOrder<T>(
  this: Repository<T>,
  order: FindOptionsOrder<T>,
) {
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

export class ExtendedRepository<T = unknown> extends Repository<T> {
  async getMany<T>(
    this: Repository<T>,
    option: RepoQuery<T> = {},
    dataType?: 'count' | 'data',
  ): Promise<IGetData<T>> {
    const { pagination, where, order, relations, select } = option;
    // You can remark these lines(if order {}) if you don't want to use strict order roles
    if (order) {
      filterOrder.call(this, order);
    }

    const condition: FindManyOptions<T> = {
      relations,
      ...(select && { select }),
      ...(where && !isEmptyObject(where) && { where: processWhere(where) }),
      ...(order && { order }),
      ...(pagination && {
        skip: pagination.page * pagination.size,
        take: pagination.size,
      }),
    };

    if (dataType === 'count') {
      return { count: await this.count(condition) };
    }

    if (dataType === 'data') {
      return { data: await this.find(condition) };
    }

    const [data, count] = await this.findAndCount(condition);
    return { data, count };
  }

  async getOne<T>(
    this: Repository<T>,
    { where, relations, select }: OneRepoQuery<T>,
  ): Promise<T> {
    const condition: FindOneOptions<T> = {
      relations,
      ...(select && { select }),
      ...(where && { where: processWhere(where) }),
    };

    return await this.findOne(condition);
  }
}
