import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { PlaceModule } from './place/place.module';
import { UploadModule } from './upload/upload.module';
import { UserModule } from './user/user.module';
import { DeclareModule } from './declare/declare.module';
import { getEnvPath } from './modules/helper/env.helper';
import { CronModule } from './cron/cron.module';
import { ScheduleModule } from '@nestjs/schedule';
import { SharedModule } from './modules/shared/shared.module';
import { SettingService } from './modules/shared/services/setting.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: getEnvPath(`${__dirname}/..`),
    }),
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [SharedModule],
      inject: [SettingService],
      useFactory: (SettingService: SettingService) =>
        SettingService.graphqlUseFactory,
    }),
    TypeOrmModule.forRootAsync({
      imports: [SharedModule],
      inject: [SettingService],
      useFactory: (settingService: SettingService) =>
        settingService.TypeOrmUseFactory,
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
