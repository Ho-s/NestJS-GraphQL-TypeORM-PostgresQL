import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from './auth/auth.module';
import { CustomCacheModule } from './cache/custom-cache.module';
import {
  typeormConfigKey,
  typeormConfigLoader,
} from './common/config/ormconfig';
import { getEnvPath } from './common/helper/env.helper';
import { envValidation } from './common/helper/env.validation';
import { SettingModule } from './common/shared/setting/setting.module';
import { SettingService } from './common/shared/setting/setting.service';
import { HealthModule } from './health/health.module';
import { UploadModule } from './upload/upload.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: getEnvPath(`${__dirname}/..`),
      validate: envValidation,
      load: [typeormConfigLoader],
    }),
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [SettingModule],
      inject: [SettingService],
      useFactory: (settingService: SettingService) =>
        settingService.graphqlUseFactory,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        configService.get(typeormConfigKey),
    }),
    UserModule,
    AuthModule,
    UploadModule,
    HealthModule,
    CustomCacheModule.forRoot(),
  ],
})
export class AppModule {}
