import { SetMetadata } from '@nestjs/common';

export const CUSTOM_CACHE = Symbol('CUSTOM_CACHE');
export interface CustomCacheOptions {
  key?: string;

  ttl?: number;

  logger?: (...args: unknown[]) => unknown;
}

export const CustomCache = (options: CustomCacheOptions = {}) =>
  SetMetadata(CUSTOM_CACHE, options);
