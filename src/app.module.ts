import GraphQLJSON from 'graphql-type-json';
import { join } from 'path';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { Place, User } from './entities';
import { PlaceModule } from './place/place.module';
import { UploadModule } from './upload/upload.module';
import { UserModule } from './user/user.module';
import { DeclareModule } from './declare/declare.module';
import { getEnvPath } from './modules/helper/env.helper';
import { ApolloServerPluginLandingPageLocalDefault } from 'apollo-server-core';
import { GraphQLFormattedError } from 'graphql';
import { CronModule } from './cron/cron.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: getEnvPath(`${__dirname}/..`),
    }),
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uploads: false,
        resolvers: { JSON: GraphQLJSON },
        autoSchemaFile: join(process.cwd(), 'src/graphql-schema.gql'),
        sortSchema: true,
        playground: false,
        ...(configService.get('NODE_ENV') !== 'production' && {
          plugins: [ApolloServerPluginLandingPageLocalDefault()],
        }),
        context: ({ req }) => ({ req }),
        cors: {
          origin: '*',
          Credential: true,
        },
        cache: 'bounded',
        formatError: (error) => {
          const extensions: any = error.extensions;
          const standardError: GraphQLFormattedError = {
            message: error.extensions?.message || error.message,
            ...error,
            extensions: {
              __orginal: {
                ...extensions,
              },
              code: error.extensions?.code || 'UNKNOWN ERROR',
              message: error.extensions?.message || error.message,
            },
          };
          // HTTP Exception
          if (extensions?.exception) {
            standardError.extensions.message = extensions.exception.message;
            standardError.extensions.status = extensions.exception.status;
          }
          // Class vaildation Exception
          if (extensions?.response) {
            standardError.extensions.message = extensions.response.message;
            standardError.extensions.status = extensions.response.statusCode;
          }
          return standardError;
        },
      }),
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USER'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        entities: [User, Place],
        timezone: '+09:00',
        synchronize: true,
        autoLoadEntities: true,
        // logging:true
      }),
    }),
    ScheduleModule.forRoot(),
    UserModule,
    AuthModule,
    PlaceModule,
    UploadModule,
    DeclareModule,
    CronModule,
  ],
})
export class AppModule {}
