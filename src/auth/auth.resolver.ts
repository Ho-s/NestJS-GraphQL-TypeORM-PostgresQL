import { JwtWithUser } from '../entities/auth/auth.entity';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { SignInInput, SignUpInput } from 'src/entities/auth/auth.input';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => JwtWithUser)
  async signIn(@Args('input') input: SignInInput) {
    return await this.authService.signIn(input);
  }

  @Mutation(() => JwtWithUser, {
    description:
      'Before you start to sign up, you have to set private key and public key in ./util/jwt.util.ts',
  })
  async signUp(@Args('input') input: SignUpInput) {
    return await this.authService.signUp(input);
  }
}
