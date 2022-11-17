import { decode } from '../../auth/util/jwt.util';
import { User } from '../../entities';
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
    const req = this.getRequest(context);
    const { authorization } = req.headers;
    const user = decode(authorization);
    if (!user) {
      return false;
    }

    req.user = user;
    const { role } = user as User;
    const ADMIN = 'admin';

    if (role === ADMIN) {
      return true;
    }

    return this.hasAccess(role, this._roles);
  }

  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req;
  }

  private hasAccess(role: string, requiredRoles: string[]): boolean {
    return requiredRoles.some((v: string) => v === role);
  }
}
