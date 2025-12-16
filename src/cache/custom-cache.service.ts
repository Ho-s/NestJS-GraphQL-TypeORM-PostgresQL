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

        return this.getOrSetCache(customKey, args, options, result);
      };

      Object.defineProperty(instance, methodName, {
        value: methodOverride.bind(instance),
      });
    };
  }

  async getCache(key: string, logger?: CustomCacheOptions['logger']) {
    const cached = await this.cacheManager.get(key);
    if (cached !== undefined) {
      logger?.('Cache Hit', { cacheKey: key });
    }
    return cached;
  }

  async setCache(
    key: string,
    data: unknown,
    ttl: number = Infinity,
    logger?: CustomCacheOptions['logger'],
  ) {
    await this.cacheManager.set(key, data, ttl);
    logger?.('Cached', { cacheKey: key });
  }

  buildCacheKey(customKey: string, args: unknown[]) {
    return customKey + JSON.stringify(args);
  }

  async getOrSetCache(
    customKey: string,
    args: unknown[],
    options: CustomCacheOptions,
    resultFn: () => Promise<unknown>,
  ) {
    const { key: cacheKey = customKey, ttl = Infinity, logger } = options;
    const argsAddedKey = this.buildCacheKey(cacheKey, args);

    const cachedValue = await this.getCache(argsAddedKey, logger);
    if (cachedValue !== undefined) {
      return cachedValue;
    }

    const result = await resultFn();
    await this.setCache(argsAddedKey, result, ttl, logger);

    return result;
  }
}
