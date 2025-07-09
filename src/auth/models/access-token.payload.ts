import { Field, ID, ObjectType } from '@nestjs/graphql';

import { User, UserRole, UserRoleType } from 'src/user/entities/user.entity';

@ObjectType()
export class AccessTokenPayload implements Partial<User> {
  @Field(() => ID)
  id: string;

  @Field(() => UserRole)
  role: UserRoleType;

  @Field(() => String, { nullable: true })
  refreshToken?: string;
}
