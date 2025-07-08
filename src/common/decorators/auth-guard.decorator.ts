import { SetMetadata, UseGuards, applyDecorators } from '@nestjs/common';

import { UserRole, UserRoleType } from 'src/user/entities/user.entity';

import { GraphqlPassportAuthGuard } from '../guards/graphql-passport-auth.guard';

export const GUARD_ROLE = Symbol('GUARD_ROLE');

export const UseAuthGuard = (roles?: UserRoleType | UserRoleType[]) =>
  applyDecorators(
    SetMetadata(
      GUARD_ROLE,
      roles ? (Array.isArray(roles) ? roles : [roles]) : [UserRole.USER],
    ),
    UseGuards(GraphqlPassportAuthGuard),
  );
