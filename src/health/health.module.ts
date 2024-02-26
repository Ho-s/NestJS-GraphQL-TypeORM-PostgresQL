import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';

import { HealthController } from './health.controller';
import { PingIndicator } from './indicator/ping.indicator';

@Module({
  imports: [TerminusModule, HttpModule],
  controllers: [HealthController],
  providers: [PingIndicator],
})
export class HealthModule {}
