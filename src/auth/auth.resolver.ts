import { JwtWithUser } from './entities/auth._entity';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { SignInInput, SignUpInput } from 'src/auth/inputs/auth.input';
import { UseGuards } from '@nestjs/common';
import { User } from 'src/user/entities/user.entity';
import { CurrentUser } from 'src/common/decorators/user.decorator';
import { SignInGuard } from 'src/common/guards/graphql-signin-guard';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => JwtWithUser)
  @UseGuards(SignInGuard)
  signIn(@CurrentUser() user: User, @Args('input') _: SignInInput) {
    return this.authService.signIn(user);
  }

  @Mutation(() => JwtWithUser, {
    description:
      'Before you start to sign up, you have to set private key and public key in .env',
  })
  signUp(@Args('input') input: SignUpInput) {
    return this.authService.signUp(input);
  }
}
