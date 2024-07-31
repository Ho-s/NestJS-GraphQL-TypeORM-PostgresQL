import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import * as bcrypt from 'bcrypt';
import { pick } from 'lodash';

import { SignInInput, SignUpInput } from 'src/auth/inputs/auth.input';
import { User } from 'src/user/entities/user.entity';

import { UserService } from '../user/user.service';
import { JwtWithUser } from './entities/auth._entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
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
  ): Promise<User> {
    try {
      this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_TOKEN_PRIVATE_KEY'),
      });
      return this.userService.getOne({ where: { id: userId, refreshToken } });
    } catch (err) {
      if (err.message === 'jwt expired') {
        this.userService.update(userId, { refreshToken: null });
      }
    }
  }

  generateAccessToken(user: User, refreshToken: string) {
    return this.jwtService.sign({
      ...pick(user, ['id', 'role']),
      refreshToken,
    });
  }

  async signUp(input: SignUpInput): Promise<JwtWithUser> {
    const doesExistId = await this.userService.getOne({
      where: { username: input.username },
    });

    if (doesExistId) {
      throw new BadRequestException('Username already exists');
    }

    const user = await this.userService.create({ ...input, role: 'user' });

    return this.signIn(user);
  }

  async signIn(user: User) {
    const refreshToken = await this.generateRefreshToken(user.id);
    const jwt = this.generateAccessToken(user, refreshToken);

    return { jwt, user };
  }

  async validateUser(input: SignInInput) {
    const { username, password } = input;

    const user = await this.userService.getOne({ where: { username } });
    if (!user) {
      return null;
    }
    const isValid: boolean = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return null;
    }

    return user;
  }
}
