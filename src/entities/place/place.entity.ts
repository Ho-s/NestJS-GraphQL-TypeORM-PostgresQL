import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../user';

@ObjectType()
@Entity()
export class Place {
  @Field(() => ID)
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Field(() => String)
  @Column()
  name: string;

  @Field(() => String)
  @Column()
  address: string;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, (user) => user.place)
  user: User;
}

@ObjectType()
export class GetPlaceType {
  @Field(() => [Place], { nullable: true })
  data?: Place[];

  @Field(() => Number, { nullable: true })
  count?: number;
}
