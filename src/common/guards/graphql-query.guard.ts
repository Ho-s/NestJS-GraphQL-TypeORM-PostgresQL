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

@Injectable()
export class GraphqlQueryGuard<T extends ClassConstructor> {
  constructor(
    private reflector: Reflector,
    private readonly dataSource: DataSource,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const permission = this.reflector.get<FindOptionsSelect<T>>(
      PERMISSION,
      context.getHandler(),
    );

    const entity = this.reflector.get<T>(INSTANCE, context.getHandler());
    const repository = this.dataSource.getRepository<T>(entity);

    const ctx = GqlExecutionContext.create(context);
    const query = getCurrentGraphQLQuery(ctx);

    const { select }: GetInfoFromQueryProps<T> = getOptionFromGqlQuery.call(
      repository,
      query,
    );

    return Object.keys(select).every((key) => permission[key]);
  }
}
