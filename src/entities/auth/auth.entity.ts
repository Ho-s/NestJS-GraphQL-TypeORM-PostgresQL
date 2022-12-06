import { Field, ObjectType } from '@nestjs/graphql';
import { User } from '..';

@ObjectType()
export class JwtWithUser {
  @Field(() => String)
  jwt: string;

  @Field(() => User)
  user: User;
}
