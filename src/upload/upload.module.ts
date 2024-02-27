import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { UploadResolver } from './upload.resolver';
import { UploadService } from './upload.service';

@Module({
  imports: [ConfigModule, HttpModule.register({})],
  providers: [UploadService, UploadResolver],
})
export class UploadModule {}
