import {
  GetUserType,
  User,
  CreateUserInput,
  UpdateUserInput,
} from '../entities';
import { CurrentUser } from '../modules/decorators/user.decorator';
import { GraphqlPassportAuthGuard } from '../modules/guards/graphql-passport-auth.guard';
import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UserService } from './user.service';
import GraphQLJSON from 'graphql-type-json';
import { GetManyInput, GetOneInput } from 'src/declare/input/custom.input';

@Resolver()
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => GetUserType)
  @UseGuards(new GraphqlPassportAuthGuard('admin'))
  getManyUsers(
    @Args({ name: 'input', nullable: true })
    qs: GetManyInput<User>,
  ) {
    return this.userService.getMany(qs);
  }

  @Query(() => User)
  @UseGuards(new GraphqlPassportAuthGuard('admin'))
  getOneUser(
    @Args({ name: 'input', nullable: true })
    qs: GetOneInput<User>,
  ) {
    return this.userService.getOne(qs);
  }

  @Mutation(() => User)
  @UseGuards(new GraphqlPassportAuthGuard('admin'))
  createUser(@Args('input') input: CreateUserInput) {
    return this.userService.create(input);
  }

  @Mutation(() => [User])
  @UseGuards(new GraphqlPassportAuthGuard('admin'))
  createManyUsers(
    @Args({ name: 'input', type: () => [CreateUserInput] })
    input: CreateUserInput[],
  ) {
    return this.userService.createMany(input);
  }

  @Mutation(() => User)
  @UseGuards(new GraphqlPassportAuthGuard('admin'))
  updateUser(@Args('id') id: string, @Args('input') input: UpdateUserInput) {
    return this.userService.update(id, input);
  }

  @Mutation(() => GraphQLJSON)
  @UseGuards(new GraphqlPassportAuthGuard('admin'))
  deleteUser(@Args('id') id: string) {
    return this.userService.delete(id);
  }

  @Query(() => User)
  @UseGuards(new GraphqlPassportAuthGuard('user'))
  getMe(@CurrentUser() user: User) {
    return this.userService.getOne({
      where: { id: user.id },
      relations: ['place'],
    });
  }
}
