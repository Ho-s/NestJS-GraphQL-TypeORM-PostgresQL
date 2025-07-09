import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import * as bcrypt from 'bcrypt';

import { SignInInput, SignUpInput } from 'src/auth/inputs/auth.input';
import {
  CustomConflictException,
  CustomUnauthorizedException,
} from 'src/common/exceptions';
import { EnvironmentVariables } from 'src/common/helper/env.validation';
import { UserRole } from 'src/user/entities/user.entity';

import { UserService } from '../user/user.service';
import { AccessTokenPayload } from './models/access-token.payload';
import { JwtWithUser } from './models/auth.model';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<EnvironmentVariables>,
  ) {}

  private async generateRefreshToken(userId: string) {
    const refreshToken = this.jwtService.sign(
      { id: userId },
      {
        secret: this.configService.get('JWT_REFRESH_TOKEN_PRIVATE_KEY'),
        expiresIn: '7d',
      },
    );
    await this.userService.update(userId, { refreshToken });

    return refreshToken;
  }

  async verifyRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<boolean> {
    try {
      this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_TOKEN_PRIVATE_KEY'),
      });

      return this.userService.doesExist({ id: userId, refreshToken });
    } catch (err) {
      if (err.message === 'jwt expired') {
        this.userService.update(userId, { refreshToken: null });
      }
    }
  }

  generateAccessToken(user: AccessTokenPayload, refreshToken: string) {
    return this.jwtService.sign({
      ...user,
      refreshToken,
    });
  }

  async signUp(input: SignUpInput): Promise<JwtWithUser> {
    const doesExist = await this.userService.getOne({
      where: { username: input.username },
    });

    if (doesExist) {
      throw new CustomConflictException({ property: 'username' });
    }

    const user = await this.userService.create({
      ...input,
      role: UserRole.USER,
    });

    return this.signIn(user);
  }

  async signIn(user: AccessTokenPayload) {
    const refreshToken = await this.generateRefreshToken(user.id);
    const jwt = this.generateAccessToken(user, refreshToken);

    return { jwt, user };
  }

  async validateUser(input: SignInInput): Promise<AccessTokenPayload> {
    const { username, password } = input;

    const user = await this.userService.getOne({
      where: { username },
      select: { id: true, role: true, password: true },
    });

    if (!user) {
      throw new CustomUnauthorizedException();
    }

    const isValid: boolean = await bcrypt.compare(password, user.password);

    if (!isValid) {
      throw new CustomUnauthorizedException();
    }

    delete user.password;

    return user;
  }
}
