import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';

import { ExtractJwt, Strategy, VerifiedCallback } from 'passport-jwt';

import { CustomUnauthorizedException } from 'src/common/exceptions';
import { EnvironmentVariables } from 'src/common/helper/env.validation';

import { AuthService } from '../auth.service';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private readonly configService: ConfigService<EnvironmentVariables>,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('JWT_PUBLIC_KEY'),
    });
  }

  async validate(
    payload: { id: string; refreshToken: string },
    done: VerifiedCallback,
  ) {
    try {
      const userData = await this.authService.verifyRefreshToken(
        payload.id,
        payload.refreshToken,
      );

      done(null, userData);
    } catch (err) {
      throw new CustomUnauthorizedException({ message: err.message });
    }
  }
}
