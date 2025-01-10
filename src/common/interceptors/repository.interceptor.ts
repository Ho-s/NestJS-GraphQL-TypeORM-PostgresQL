import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';

import { Observable } from 'rxjs';
import { DataSource } from 'typeorm';

import { REPOSITORY_INTERCEPTOR } from '../decorators/repository-interceptor.decorator';
import { TYPEORM_CUSTOM_REPOSITORY } from '../decorators/typeorm.decorator';

@Injectable()
export class QueryIntercepter<T> implements NestInterceptor {
  constructor(
    private readonly dataSource: DataSource,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const ctx = GqlExecutionContext.create(context);

    const repository = this.reflector.get(
      REPOSITORY_INTERCEPTOR,
      ctx.getHandler(),
    );

    const entity = this.reflector.get(TYPEORM_CUSTOM_REPOSITORY, repository);

    const baseRepository = this.dataSource.getRepository<T>(entity);

    const request = ctx.getContext().req;
    request.repository = baseRepository;

    return next.handle();
  }
}
