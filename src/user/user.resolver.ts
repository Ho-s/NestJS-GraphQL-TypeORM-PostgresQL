import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import GraphQLJSON from 'graphql-type-json';

import { AccessTokenPayload } from 'src/auth/models/access-token.payload';
import { CustomCache } from 'src/cache/custom-cache.decorator';
import { UseAuthGuard } from 'src/common/decorators/auth-guard.decorator';
import { GraphQLQueryToOption } from 'src/common/decorators/option.decorator';
import { UseRepositoryInterceptor } from 'src/common/decorators/repository-interceptor.decorator';
import { GetManyInput, GetOneInput } from 'src/common/graphql/custom.input';
import { GetInfoFromQueryProps } from 'src/common/graphql/utils/types';

import { CurrentUser } from '../common/decorators/user.decorator';
import { GetUserType, User, UserRole } from './entities/user.entity';
import { CreateUserInput, UpdateUserInput } from './inputs/user.input';
import { UserService } from './user.service';

@Resolver()
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => GetUserType)
  @UseAuthGuard(UserRole.ADMIN)
  @UseRepositoryInterceptor(User)
  @CustomCache({ logger: console.log, ttl: 1000 })
  getManyUserList(
    @Args({ name: 'input', nullable: true })
    condition: GetManyInput<User>,
    @GraphQLQueryToOption<User>()
    option: GetInfoFromQueryProps<User>,
  ) {
    return this.userService.getMany({ ...condition, ...option });
  }

  @Query(() => User)
  @UseAuthGuard(UserRole.ADMIN)
  @UseRepositoryInterceptor(User)
  getOneUser(
    @Args({ name: 'input' })
    condition: GetOneInput<User>,
    @GraphQLQueryToOption<User>()
    option: GetInfoFromQueryProps<User>,
  ) {
    return this.userService.getOne({ ...condition, ...option });
  }

  @Mutation(() => User)
  @UseAuthGuard(UserRole.ADMIN)
  createUser(@Args('input') input: CreateUserInput) {
    return this.userService.create(input);
  }

  @Mutation(() => GraphQLJSON)
  @UseAuthGuard(UserRole.ADMIN)
  updateUser(@Args('id') id: string, @Args('input') input: UpdateUserInput) {
    return this.userService.update(id, input);
  }

  @Mutation(() => GraphQLJSON)
  @UseAuthGuard(UserRole.ADMIN)
  deleteUser(@Args('id') id: string) {
    return this.userService.delete(id);
  }

  @Query(() => User)
  @UseAuthGuard()
  @UseRepositoryInterceptor(User)
  getMe(
    @CurrentUser() user: AccessTokenPayload,
    @GraphQLQueryToOption<User>()
    option: GetInfoFromQueryProps<User>,
  ) {
    return this.userService.getOne({
      where: { id: user.id },
      ...option,
    });
  }
}
