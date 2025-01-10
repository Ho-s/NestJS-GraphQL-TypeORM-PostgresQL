import { SetMetadata, UseGuards, applyDecorators } from '@nestjs/common';

import { GraphqlPassportAuthGuard } from '../guards/graphql-passport-auth.guard';

export const GUARD_ROLE = Symbol('GUARD_ROLE');

export const UseAuthGuard = (roles?: string | string[]) =>
  applyDecorators(
    SetMetadata(
      GUARD_ROLE,
      roles ? (Array.isArray(roles) ? roles : [roles]) : ['user'],
    ),
    UseGuards(GraphqlPassportAuthGuard),
  );
