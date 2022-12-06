import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { User, UserIdInput } from '..';

@InputType()
export class CreatePlaceInput {
  @Field(() => String)
  @IsNotEmpty()
  name: string;

  @Field(() => String)
  @IsNotEmpty()
  address: string;

  @Field(() => UserIdInput)
  @IsNotEmpty()
  user: Partial<User>;
}

@InputType()
export class UpdatePlaceInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  name?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  address?: string;
}
