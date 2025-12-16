import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';

import { Observable, from, of, switchMap, tap } from 'rxjs';

import { CUSTOM_CACHE, CustomCacheOptions } from './custom-cache.decorator';
import { CustomCacheService } from './custom-cache.service';

@Injectable()
export class CustomCacheInterceptor implements NestInterceptor {
  constructor(
    private readonly customCacheService: CustomCacheService,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const handler = context.getHandler();
    const options = this.reflector.get<CustomCacheOptions>(
      CUSTOM_CACHE,
      handler,
    );

    if (!options) {
      return next.handle();
    }

    const { key, ttl, logger } = options;
    const customKey = `${context.getClass().name}.${handler.name}`;
    const args = this.getArgs(context);
    const cacheKey = this.customCacheService.buildCacheKey(
      key ?? customKey,
      args,
    );

    return from(this.customCacheService.getCache(cacheKey, logger)).pipe(
      switchMap((cached) =>
        cached !== undefined
          ? of(cached)
          : next
              .handle()
              .pipe(
                tap((data) =>
                  this.customCacheService.setCache(cacheKey, data, ttl, logger),
                ),
              ),
      ),
    );
  }

  private getArgs(context: ExecutionContext): unknown[] {
    const ctx = GqlExecutionContext.create(context);
    return Object.values(ctx.getArgs());
  }
}
