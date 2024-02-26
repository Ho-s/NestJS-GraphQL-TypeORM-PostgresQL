import { Field, ObjectType } from '@nestjs/graphql';

import { User } from 'src/user/entities/user.entity';

@ObjectType()
export class JwtWithUser {
  @Field(() => String)
  jwt: string;

  @Field(() => User)
  user: User;
}
