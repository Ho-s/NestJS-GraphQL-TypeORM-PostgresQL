import { Field, ObjectType } from '@nestjs/graphql';

import { AccessTokenPayload } from './access-token.payload';

@ObjectType()
export class JwtWithUser {
  @Field(() => String)
  jwt: string;

  @Field(() => AccessTokenPayload)
  user: AccessTokenPayload;
}
