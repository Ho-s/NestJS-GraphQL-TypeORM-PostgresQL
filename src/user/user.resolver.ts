import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import GraphQLJSON from 'graphql-type-json';

import { CustomCache } from 'src/cache/custom-cache.decorator';
import { UseAuthGuard } from 'src/common/decorators/auth-guard.decorator';
import { GraphQLQueryToOption } from 'src/common/decorators/option.decorator';
import { UseQueryGuard } from 'src/common/decorators/query-guard.decorator';
import { UseRepositoryInterceptor } from 'src/common/decorators/repository-interceptor.decorator';
import { GetManyInput, GetOneInput } from 'src/common/graphql/custom.input';
import { GetInfoFromQueryProps } from 'src/common/graphql/utils/types';

import { CurrentUser } from '../common/decorators/user.decorator';
import { GetUserType, User } from './entities/user.entity';
import { CreateUserInput, UpdateUserInput } from './inputs/user.input';
import { UserService } from './user.service';

@Resolver()
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => GetUserType)
  @UseAuthGuard('admin')
  @UseQueryGuard(User, { username: true })
  @UseRepositoryInterceptor(User)
  @CustomCache({ logger: console.log, ttl: 1000 })
  getManyUserList(
    @Args({ name: 'input', nullable: true })
    condition: GetManyInput<User>,
    @GraphQLQueryToOption<User>(true)
    option: GetInfoFromQueryProps<User>,
  ) {
    return this.userService.getMany({ ...condition, ...option });
  }

  @Query(() => User)
  @UseAuthGuard('admin')
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
  @UseAuthGuard('admin')
  createUser(@Args('input') input: CreateUserInput) {
    return this.userService.create(input);
  }

  @Mutation(() => GraphQLJSON)
  @UseAuthGuard('admin')
  updateUser(@Args('id') id: string, @Args('input') input: UpdateUserInput) {
    return this.userService.update(id, input);
  }

  @Mutation(() => GraphQLJSON)
  @UseAuthGuard('admin')
  deleteUser(@Args('id') id: string) {
    return this.userService.delete(id);
  }

  @Query(() => User)
  @UseAuthGuard()
  @UseQueryGuard(User, { username: true })
  @UseRepositoryInterceptor(User)
  getMe(
    @CurrentUser() user: User,
    @GraphQLQueryToOption<User>()
    option: GetInfoFromQueryProps<User>,
  ) {
    return this.userService.getOne({
      where: { id: user.id },
      ...option,
    });
  }
}
