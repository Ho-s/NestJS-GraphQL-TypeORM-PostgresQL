import { Field, InputType } from '@nestjs/graphql';

import { IsNotEmpty } from 'class-validator';

@InputType()
export class SignInInput {
  @Field(() => String)
  @IsNotEmpty()
  username: string;

  @Field(() => String)
  @IsNotEmpty()
  password: string;
}

@InputType()
export class SignUpInput extends SignInInput {
  @Field(() => String)
  @IsNotEmpty()
  nickname: string;
}
