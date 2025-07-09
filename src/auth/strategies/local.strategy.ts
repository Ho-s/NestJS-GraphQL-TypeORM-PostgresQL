import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

import { Strategy } from 'passport-local';

import { AuthService } from '../auth.service';
import { AccessTokenPayload } from '../models/access-token.payload';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'username',
      passwordField: 'password',
    });
  }
  async validate(
    username: string,
    password: string,
  ): Promise<AccessTokenPayload> {
    const user = await this.authService.validateUser({ username, password });

    return user;
  }
}
