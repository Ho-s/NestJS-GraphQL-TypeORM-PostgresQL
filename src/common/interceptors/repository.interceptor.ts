import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { Observable } from 'rxjs';
import { DataSource, EntityTarget, ObjectLiteral } from 'typeorm';

import { REPOSITORY_INTERCEPTOR } from '../decorators/repository-interceptor.decorator';

@Injectable()
export class QueryIntercepter<
  T extends ObjectLiteral,
> implements NestInterceptor {
  constructor(private readonly dataSource: DataSource) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const ctx = GqlExecutionContext.create(context);

    const entity: EntityTarget<T> = Reflect.getMetadata(
      REPOSITORY_INTERCEPTOR,
      ctx.getHandler(),
    );

    const baseRepository = this.dataSource.getRepository<T>(entity);

    const request = ctx.getContext().req;
    request.repository = baseRepository;

    return next.handle();
  }
}
