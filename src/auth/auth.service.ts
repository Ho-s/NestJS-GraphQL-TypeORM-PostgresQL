import { UserService } from '../user/user.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { SignInInput, SignUpInput } from 'src/auth/inputs/auth.input';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { pick } from 'lodash';
import { User } from 'src/user/entities/user.entity';
import { JwtWithUser } from './entities/auth._entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  private signJWT(user: User) {
    return this.jwtService.sign(pick(user, ['id', 'role']));
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

  signIn(user: User) {
    const jwt = this.signJWT(user);

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
