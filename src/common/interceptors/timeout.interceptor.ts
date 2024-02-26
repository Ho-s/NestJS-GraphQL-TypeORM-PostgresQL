import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';

import { timeout } from 'rxjs/operators';

const REQUEST_TIMEOUT = 30000000;

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  intercept(_: ExecutionContext, next: CallHandler<unknown>) {
    return next.handle().pipe(timeout(REQUEST_TIMEOUT));
  }
}
