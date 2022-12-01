import { Injectable, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GraphqlPassportAuthGuard extends AuthGuard('jwt') {
  _roles: string[] = ['user'];

  constructor(roles?: string | string[]) {
    super();
    if (roles) {
      this._roles = Array.isArray(roles) ? roles : [roles];
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    await super.canActivate(context);
    const ctx = GqlExecutionContext.create(context);
    const req = ctx.getContext().req;
    const { role } = req.user;

    if (role === 'admin') {
      return true;
    }

    return this.hasAccess(role, this._roles);
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
