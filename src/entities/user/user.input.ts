import { IsNotEmpty, IsOptional } from 'class-validator';
import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateUserInput {
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
}

@InputType()
export class UpdateUserInput {
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
}
