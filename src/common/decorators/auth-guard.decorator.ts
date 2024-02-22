import { SetMetadata, UseGuards, applyDecorators } from '@nestjs/common';
import { GraphqlPassportAuthGuard } from '../guards/graphql-passport-auth.guard';

export const UseAuthGuard = (roles?: string | string[]) =>
  applyDecorators(
    SetMetadata(
      'roles',
      roles ? (Array.isArray(roles) ? roles : [roles]) : ['user'],
    ),
    UseGuards(GraphqlPassportAuthGuard),
  );
