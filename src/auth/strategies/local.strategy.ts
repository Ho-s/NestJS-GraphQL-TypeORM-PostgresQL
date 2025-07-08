import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

import { Strategy } from 'passport-local';

import { CustomUnauthorizedException } from 'src/common/exceptions';

import { AuthService } from '../auth.service';
import { SignInInput } from '../inputs/auth.input';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'username',
      passwordField: 'password',
    });
  }
  validate(username: string, password: string): Promise<SignInInput> {
    const user = this.authService.validateUser({ username, password });

    if (!user) {
      throw new CustomUnauthorizedException();
    }

    return user;
  }
}
