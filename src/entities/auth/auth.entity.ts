import { Field, ObjectType } from '@nestjs/graphql';
import { User } from '..';

@ObjectType()
export class JwtWithUser extends User {
  @Field(() => String)
  jwt: string;
}
