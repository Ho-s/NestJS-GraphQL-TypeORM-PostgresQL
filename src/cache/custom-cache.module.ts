import { CacheModule, CacheModuleOptions } from '@nestjs/cache-manager';
import { DynamicModule, Module, OnModuleInit } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';

import { CustomCacheService } from './custom-cache.service';

@Module({})
export class CustomCacheModule implements OnModuleInit {
  constructor(private readonly customCacheService: CustomCacheService) {}

  static forRoot(options?: CacheModuleOptions): DynamicModule {
    return {
      module: CustomCacheModule,
      imports: [CacheModule.register(options), DiscoveryModule],
      providers: [CustomCacheService],
      global: true,
    };
  }

  onModuleInit() {
    this.customCacheService.registerAllCache();
  }
}
