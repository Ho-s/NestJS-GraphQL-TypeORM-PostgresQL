import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import GraphQLJSON from 'graphql-type-json';

import { UseAuthGuard } from 'src/common/decorators/auth-guard.decorator';
import { CurrentQuery } from 'src/common/decorators/query.decorator';
import { GetManyInput, GetOneInput } from 'src/common/graphql/custom.input';

import { CurrentUser } from '../common/decorators/user.decorator';
import { GetUserType, User } from './entities/user.entity';
import { CreateUserInput, UpdateUserInput } from './inputs/user.input';
import { UserService } from './user.service';

@Resolver()
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => GetUserType)
  @UseAuthGuard('admin')
  getManyUserList(
    @Args({ name: 'input', nullable: true })
    qs: GetManyInput<User>,
    @CurrentQuery() gqlQuery: string,
  ) {
    return this.userService.getMany(qs, gqlQuery);
  }

  @Query(() => User)
  @UseAuthGuard('admin')
  getOneUser(
    @Args({ name: 'input' })
    qs: GetOneInput<User>,
    @CurrentQuery() gqlQuery: string,
  ) {
    return this.userService.getOne(qs, gqlQuery);
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
  getMe(@CurrentUser() user: User) {
    return this.userService.getOne({
      where: { id: user.id },
    });
  }
}
