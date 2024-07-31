import { Field, InputType } from '@nestjs/graphql';

import { IsNotEmpty, IsOptional } from 'class-validator';

import { User } from '../entities/user.entity';

@InputType()
export class CreateUserInput implements Partial<User> {
  @Field(() => String)
  @IsNotEmpty()
  username: string;

  @Field(() => String)
  @IsNotEmpty()
  password: string;

  @Field(() => String)
  @IsNotEmpty()
  nickname: string;

  @Field(() => String)
  @IsNotEmpty()
  role: 'admin' | 'user';

  @Field(() => String, { nullable: true })
  @IsOptional()
  refreshToken?: string;
}

@InputType()
export class UpdateUserInput implements Partial<User> {
  @Field(() => String, { nullable: true })
  @IsOptional()
  username?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  password?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  nickname?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  role?: 'admin' | 'user';

  @Field(() => String, { nullable: true })
  @IsOptional()
  refreshToken?: string;
}

@InputType()
export class UserIdInput {
  @Field(() => String)
  @IsNotEmpty()
  id: string;
}
