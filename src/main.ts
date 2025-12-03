import { HttpStatus, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';

import { NextFunction } from 'express';
import { Request, Response } from 'express';
import express from 'express';
import { GraphQLFormattedError } from 'graphql';
import graphqlUploadExpress from 'graphql-upload/graphqlUploadExpress.mjs';

import { AppModule } from './app.module';
import { GraphQLExceptionSilencer } from './common/exceptions/exception-silencer.filter';
import { EnvironmentVariables } from './common/helper/env.validation';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TimeoutInterceptor } from './common/interceptors/timeout.interceptor';

const GRAPHQL_HEADER_KEY = 'application/graphql-response+json';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalInterceptors(new TimeoutInterceptor(), new LoggingInterceptor());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.useGlobalFilters(new GraphQLExceptionSilencer());

  app.use(express.json());

  app.use(
    '/graphql',
    graphqlUploadExpress({ maxFileSize: 1000 * 1000 * 10, maxFiles: 10 }),
    (req: Request, res: Response, next: NextFunction) => {
      const accept = req.headers.accept || '';
      if (
        accept.includes(GRAPHQL_HEADER_KEY) ||
        req.method !== 'POST' ||
        req.body?.operationName === 'IntrospectionQuery'
      ) {
        return next();
      }

      res.status(HttpStatus.NOT_ACCEPTABLE).json({
        data: null,
        extensions: {
          errorStatus: HttpStatus.NOT_ACCEPTABLE,
          errorCode: 'NOT_ACCEPTABLE',
        },
        errors: [
          {
            message:
              'Not Acceptable: Server supports application/graphql-response+json only.',
          },
        ] as ReadonlyArray<GraphQLFormattedError>,
      });
    },
  );

  app.use(function (req: Request, res: Response, next: NextFunction) {
    if (req.originalUrl && req.originalUrl.split('/').pop() === 'favicon.ico') {
      return res.sendStatus(204);
    }

    next();
  });

  app.enableCors({
    origin: '*',
    credentials: true,
  });
  const configService = app
    .select(AppModule)
    .get(ConfigService<EnvironmentVariables>);

  await app.listen(configService.get('PORT'));
}
bootstrap();
