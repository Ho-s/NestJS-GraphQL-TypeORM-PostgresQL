import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { SignInInput, SignUpInput } from 'src/auth/inputs/auth.input';
import { CurrentUser } from 'src/common/decorators/user.decorator';
import { RefreshGuard } from 'src/common/guards/graphql-refresh.guard';
import { SignInGuard } from 'src/common/guards/graphql-signin.guard';
import { UserService } from 'src/user/user.service';

import { AuthService } from './auth.service';
import { AccessTokenPayload } from './models/access-token.payload';
import { JwtWithUser } from './models/auth.model';

@Resolver()
export class AuthResolver {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Mutation(() => JwtWithUser)
  @UseGuards(SignInGuard)
  signIn(
    @Args('input') _: SignInInput,
    @CurrentUser() user: AccessTokenPayload,
  ) {
    return this.authService.signIn(user);
  }

  @Mutation(() => JwtWithUser)
  signUp(@Args('input') input: SignUpInput) {
    return this.authService.signUp(input);
  }

  @Mutation(() => Boolean)
  @UseGuards(RefreshGuard)
  async signOut(@CurrentUser() user: AccessTokenPayload) {
    await this.userService.update(user.id, { refreshToken: null });
    return true;
  }

  @Mutation(() => JwtWithUser)
  @UseGuards(RefreshGuard)
  refreshAccessToken(@CurrentUser() user: AccessTokenPayload) {
    const jwt = this.authService.generateAccessToken(user, user.refreshToken);

    return { jwt, user };
  }
}
