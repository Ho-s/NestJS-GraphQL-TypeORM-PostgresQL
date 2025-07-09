import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';

import { ExtractJwt, Strategy } from 'passport-jwt';

import { CustomUnauthorizedException } from 'src/common/exceptions';
import { EnvironmentVariables } from 'src/common/helper/env.validation';

import { UserService } from '../../user/user.service';
import { AccessTokenPayload } from '../models/access-token.payload';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService<EnvironmentVariables>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('JWT_PUBLIC_KEY'),
    });
  }

  async validate(payload: AccessTokenPayload): Promise<AccessTokenPayload> {
    const doesExist = await this.userService.doesExist({ id: payload.id });

    if (!doesExist) {
      throw new CustomUnauthorizedException();
    }

    return payload;
  }
}
