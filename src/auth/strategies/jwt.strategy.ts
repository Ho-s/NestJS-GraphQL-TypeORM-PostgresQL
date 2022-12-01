import { ExtractJwt, Strategy, VerifiedCallback } from 'passport-jwt';
import { UserService } from '../../user/user.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      algorithm: 'RS256',
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: any, done: VerifiedCallback) {
    try {
      const userData = await this.userService.getOne({
        where: { id: payload.id },
      });

      done(null, userData);
    } catch (err) {
      throw new UnauthorizedException('Error', (err as any).message);
    }
  }
}
