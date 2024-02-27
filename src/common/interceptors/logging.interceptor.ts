import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';

import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler<unknown>) {
    const date = new Date().toISOString();
    const { fieldName } = context.getArgs()[3] ?? { fieldName: 'REST API' };
    const message = `${date} Request-Response time of ${fieldName}`;
    console.time(message);
    return next.handle().pipe(tap(() => console.timeEnd(message)));
  }
}
