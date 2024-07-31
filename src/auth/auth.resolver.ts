import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { SignInInput, SignUpInput } from 'src/auth/inputs/auth.input';
import { CurrentUser } from 'src/common/decorators/user.decorator';
import { RefreshGuard } from 'src/common/guards/graphql-refresh.guard';
import { SignInGuard } from 'src/common/guards/graphql-signin.guard';
import { User } from 'src/user/entities/user.entity';

import { AuthService } from './auth.service';
import { JwtWithUser } from './entities/auth._entity';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => JwtWithUser)
  @UseGuards(SignInGuard)
  signIn(@Args('input') _: SignInInput, @CurrentUser() user: User) {
    return this.authService.signIn(user);
  }

  @Mutation(() => JwtWithUser)
  signUp(@Args('input') input: SignUpInput) {
    return this.authService.signUp(input);
  }

  @Mutation(() => JwtWithUser)
  @UseGuards(RefreshGuard)
  refreshAccessToken(@CurrentUser() user: User) {
    const jwt = this.authService.generateAccessToken(user, user.refreshToken);

    return { jwt, user };
  }
}
