import { Injectable, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GraphqlPassportAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );
    await super.canActivate(context);
    const ctx = GqlExecutionContext.create(context);
    const req = ctx.getContext().req;
    const { role } = req.user;

    if (role === 'admin') {
      return true;
    }

    return this.hasAccess(role, requiredRoles);
  }

  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    const req = ctx.getContext().req;
    return req;
  }

  private hasAccess(role: string, requiredRoles: string[]): boolean {
    return requiredRoles.some((v: string) => v === role);
  }
}
