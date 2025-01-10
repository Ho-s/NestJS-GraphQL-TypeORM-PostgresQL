import { SetMetadata, UseInterceptors, applyDecorators } from '@nestjs/common';

import { QueryIntercepter } from '../interceptors/repository.interceptor';

export const REPOSITORY_INTERCEPTOR = Symbol('REPOSITORY_INTERCEPTOR');

export const UseRepositoryInterceptor = <T>(
  entity: new (...args: unknown[]) => T,
) =>
  applyDecorators(
    SetMetadata(REPOSITORY_INTERCEPTOR, entity),
    UseInterceptors(QueryIntercepter<T>),
  );
