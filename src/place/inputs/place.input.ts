import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { UserIdInput } from 'src/user/inputs/user.input';

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
  user: UserIdInput;
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
