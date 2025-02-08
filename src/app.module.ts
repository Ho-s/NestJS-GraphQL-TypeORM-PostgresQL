import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from './auth/auth.module';
import { CustomCacheModule } from './cache/custom-cache.module';
import { GraphqlConfigService } from './common/config/graphql-config.service';
import { TypeORMConfigService } from './common/config/ormconfig.service';
import { getEnvPath } from './common/helper/env.helper';
import { envValidation } from './common/helper/env.validation';
import { HealthModule } from './health/health.module';
import { UploadModule } from './upload/upload.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: getEnvPath(`${__dirname}/..`),
      validate: envValidation,
    }),
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      useClass: GraphqlConfigService,
      imports: [ConfigModule],
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeORMConfigService,
      imports: [ConfigModule],
    }),
    UserModule,
    AuthModule,
    UploadModule,
    HealthModule,
    CustomCacheModule.forRoot(),
  ],
})
export class AppModule {}
