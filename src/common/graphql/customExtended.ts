import { BadRequestException } from '@nestjs/common';

import { isEmpty } from 'lodash';
import {
  FindManyOptions,
  FindOneOptions,
  FindOptionsOrder,
  Repository,
} from 'typeorm';

import { isObject } from 'src/util/isObject';

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
import { getConditionFromGqlQuery } from './utils/getConditionFromGqlQuery';
import { processWhere } from './utils/processWhere';

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
    { pagination, where, order, dataType = 'all', relations }: RepoQuery<T>,
    gqlQuery?: string,
  ): Promise<IGetData<T>> {
    // You can remark these lines(if order {}) if you don't want to use strict order roles
    if (order) {
      filterOrder.call(this, order);
    }

    const queryCondition = gqlQuery
      ? getConditionFromGqlQuery.call(this, gqlQuery, true)
      : { relations: undefined, select: undefined };

    const condition: FindManyOptions<T> = {
      relations: relations ?? queryCondition.relations,
      ...(queryCondition.select && { select: queryCondition.select }),
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

    return await returns[dataType]();
  }

  async getOne<T>(
    this: Repository<T>,
    { where, relations }: OneRepoQuery<T>,
    gqlQuery?: string,
  ): Promise<T> {
    const queryCondition = gqlQuery
      ? getConditionFromGqlQuery.call(this, gqlQuery)
      : { relations: undefined, select: undefined };

    const condition: FindOneOptions<T> = {
      relations: relations ?? queryCondition.relations,
      ...(queryCondition.select && { select: queryCondition.select }),
      ...(where && { where: processWhere(where) }),
    };

    return await this.findOne(condition);
  }
}
