import { JwtWithUser } from '../entities/auth';
import { UserService } from '../user/user.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { SignInInput, SignUpInput } from 'src/entities/auth/auth.input';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { pick } from 'lodash';
import { User } from 'src/entities';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  signJWT(user: User) {
    return this.jwtService.sign(pick(user, ['id', 'role']));
  }

  async signUp(input: SignUpInput): Promise<JwtWithUser> {
    const doesExistId = await this.userService.getOne({
      where: { username: input.username },
    });

    if (doesExistId) {
      throw new BadRequestException('Username already exists');
    }

    const user = await this.userService.create(input);

    const jwt = this.signJWT(user);

    return { jwt, user };
  }

  async signIn(input: SignInInput) {
    const { username, password } = input;

    if (!username || !password) {
      throw new BadRequestException(
        'Username and password are required to sign in',
      );
    }

    const user = await this.userService.getOne({ where: { username } });
    if (!user) {
      throw new BadRequestException('Username does not exist');
    }

    const isValid: boolean = await bcrypt.compare(password, user.password);

    if (!isValid) {
      throw new BadRequestException('Password is incorrect');
    }

    const jwt = this.signJWT(user);

    return { jwt, user };
  }
}
