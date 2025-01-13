import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';

import { DataSource, FindOptionsSelect } from 'typeorm';

import {
  getCurrentGraphQLQuery,
  getOptionFromGqlQuery,
} from '../decorators/option.decorator';
import {
  ClassConstructor,
  INSTANCE,
  PERMISSION,
} from '../decorators/query-guard.decorator';
import { GetInfoFromQueryProps } from '../graphql/utils/types';

const checkPermission = <T extends ClassConstructor>(
  permission: FindOptionsSelect<InstanceType<T>>,
  select: FindOptionsSelect<InstanceType<T>>,
): boolean => {
  return Object.entries(permission)
    .filter((v) => !!v[1])
    .every(([key, value]) => {
      if (typeof value === 'boolean') {
        return select[key] ? false : true;
      }

      return checkPermission(value, select[key]);
    });
};

@Injectable()
export class GraphqlQueryGuard<T extends ClassConstructor> {
  constructor(
    private reflector: Reflector,
    private readonly dataSource: DataSource,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const permission = this.reflector.get<FindOptionsSelect<InstanceType<T>>>(
      PERMISSION,
      context.getHandler(),
    );

    const entity = this.reflector.get<T>(INSTANCE, context.getHandler());
    const repository = this.dataSource.getRepository<T>(entity);

    const ctx = GqlExecutionContext.create(context);
    const query = getCurrentGraphQLQuery(ctx);

    const { select }: GetInfoFromQueryProps<InstanceType<T>> =
      getOptionFromGqlQuery.call(repository, query);

    return checkPermission<T>(permission, select);
  }
}
