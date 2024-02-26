import { Module } from '@nestjs/common';

import { SettingService } from './services/setting.service';

@Module({
  providers: [SettingService],
  exports: [SettingService],
})
export class SharedModule {}
