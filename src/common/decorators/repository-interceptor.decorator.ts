import { SetMetadata, UseInterceptors, applyDecorators } from '@nestjs/common';

import { Repository } from 'typeorm';

import { QueryIntercepter } from '../interceptors/repository.interceptor';

export const REPOSITORY_INTERCEPTOR = Symbol('REPOSITORY_INTERCEPTOR');

export const UseRepositoryInterceptor = <T>(
  repository: new (...args: unknown[]) => Repository<T>,
) =>
  applyDecorators(
    SetMetadata(REPOSITORY_INTERCEPTOR, repository),
    UseInterceptors(QueryIntercepter<T>),
  );
