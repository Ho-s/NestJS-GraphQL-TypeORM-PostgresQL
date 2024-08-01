import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';

import { Observable, lastValueFrom } from 'rxjs';

import { CUSTOM_CACHE, CustomCacheOptions } from './custom-cache.decorator';
import { CustomCacheService } from './custom-cache.service';

@Injectable()
export class CustomCacheInterceptor implements NestInterceptor {
  constructor(
    private readonly customCacheService: CustomCacheService,
    private readonly reflector: Reflector,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const handler = context.getHandler();
    const options = this.reflector.get<CustomCacheOptions>(
      CUSTOM_CACHE,
      handler,
    );

    if (!options) {
      return next.handle();
    }

    const args = this.getArgs(context);

    const customKey = `${context.getClass().name}.${handler.name}`;
    const result = async () => await lastValueFrom(next.handle());

    await this.customCacheService.setCache({
      options,
      args,
      result,
      customKey,
    });

    return next.handle();
  }

  private getArgs(context: ExecutionContext): unknown[] {
    const ctx = GqlExecutionContext.create(context);
    const req = ctx.getContext().req;
    return req.body;
  }
}
