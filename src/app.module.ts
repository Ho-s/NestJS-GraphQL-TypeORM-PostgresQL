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
import { CronModule } from './cron/cron.module';
import { ScheduleModule } from '@nestjs/schedule';
import { formatError } from './modules/format/graphql-error.format';

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
        formatError,
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
        logging: false, // if you want to see the query log, change to true
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
