import { Field, ObjectType } from '@nestjs/graphql';
import { Entity } from 'typeorm';
import { User } from '..';

@ObjectType()
@Entity()
export class JwtToken extends User {
  @Field(() => String)
  jwt: string;
}
