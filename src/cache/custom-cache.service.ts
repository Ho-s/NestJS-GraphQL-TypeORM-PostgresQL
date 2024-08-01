import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { DiscoveryService, MetadataScanner, Reflector } from '@nestjs/core';

import { CUSTOM_CACHE, CustomCacheOptions } from './custom-cache.decorator';

@Injectable()
export class CustomCacheService {
  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly metadataScanner: MetadataScanner,
    private readonly reflector: Reflector,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  registerAllCache() {
    return this.discoveryService
      .getProviders()
      .filter((wrapper) => wrapper.isDependencyTreeStatic())
      .filter(({ instance }) => instance && Object.getPrototypeOf(instance))
      .forEach(({ instance }) => {
        const prototype = Object.getPrototypeOf(instance);
        const methods = this.metadataScanner.getAllMethodNames(prototype);

        methods.forEach(this.registerCache(instance));
      });
  }

  private registerCache(instance: object) {
    return (methodName: string) => {
      const methodRef = instance[methodName];

      const options = this.reflector.get<CustomCacheOptions>(
        CUSTOM_CACHE,
        methodRef,
      );
      if (!options) {
        return;
      }

      const customKey = `${instance.constructor.name}.${methodName}`;

      const methodOverride = async (...args: unknown[]) => {
        const result = async () => await methodRef.apply(instance, args);

        return this.setCache({ customKey, options, result, args });
      };

      Object.defineProperty(instance, methodName, {
        value: methodOverride.bind(instance),
      });
    };
  }

  async setCache({
    options,
    args,
    result: _result,
    customKey,
  }: {
    options: CustomCacheOptions;
    args: unknown[];
    result: () => Promise<unknown>;
    customKey: string;
  }) {
    const { key: cacheKey = customKey, ttl = Infinity, logger } = options;

    const argsAddedKey = cacheKey + JSON.stringify(args);

    const cachedValue = await this.cacheManager.get(argsAddedKey);
    if (Boolean(cachedValue)) {
      logger?.('Cache Hit', { cacheKey });

      return cachedValue;
    }

    const result = await _result();

    await this.cacheManager.set(argsAddedKey, result, ttl);
    logger?.('Cached', { cacheKey });

    return result;
  }
}
