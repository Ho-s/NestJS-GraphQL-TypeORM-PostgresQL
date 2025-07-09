import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';

import { UserRole, UserRoleType } from 'src/user/entities/user.entity';

import { GUARD_ROLE } from '../decorators/auth-guard.decorator';

@Injectable()
export class GraphqlPassportAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.get<UserRoleType[]>(
      GUARD_ROLE,
      context.getHandler(),
    );
    await super.canActivate(context);
    const ctx = GqlExecutionContext.create(context);
    const req = ctx.getContext().req;
    const { role } = req.user;

    if (role === UserRole.ADMIN) {
      return true;
    }

    return this.hasAccess(role, requiredRoles);
  }

  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    const req = ctx.getContext().req;
    return req;
  }

  private hasAccess(
    role: UserRoleType,
    requiredRoles: UserRoleType[],
  ): boolean {
    return requiredRoles.some((v: UserRoleType) => v === role);
  }
}
