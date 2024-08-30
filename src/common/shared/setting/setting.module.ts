import { Module } from '@nestjs/common';

import { UtilModule } from '../services/util.module';
import { SettingService } from './setting.service';

@Module({
  imports: [UtilModule],
  providers: [SettingService],
  exports: [SettingService],
})
export class SettingModule {}
