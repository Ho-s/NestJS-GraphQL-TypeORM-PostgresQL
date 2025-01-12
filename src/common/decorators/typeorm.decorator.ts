import { SetMetadata } from '@nestjs/common';

export const TYPEORM_CUSTOM_REPOSITORY = Symbol('TYPEORM_CUSTOM_REPOSITORY');

export function CustomRepository<T>(
  entity: new (...args: unknown[]) => T,
): ClassDecorator {
  return SetMetadata(TYPEORM_CUSTOM_REPOSITORY, entity);
}
