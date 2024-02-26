import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';

import { ExtractJwt, Strategy, VerifiedCallback } from 'passport-jwt';

import { UserService } from '../../user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('JWT_PUBLIC_KEY'),
    });
  }

  async validate(payload: { id: string }, done: VerifiedCallback) {
    try {
      const userData = await this.userService.getOne({
        where: { id: payload.id },
      });

      done(null, userData);
    } catch (err) {
      throw new UnauthorizedException('Error', err.message);
    }
  }
}
