import { IsEmail } from 'class-validator';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import * as bcrypt from 'bcrypt';
import { Place } from 'src/place/entities/place.entity';

const BCRYPT_HASH_ROUNDS = 10;

@ObjectType()
@Entity()
export class User {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String)
  @IsEmail()
  @Column()
  username: string;

  @Column({ nullable: true })
  password: string;

  @Field(() => String)
  @Column()
  nickname: string;

  @Field(() => String)
  @Column()
  role: 'admin' | 'user';

  @Field(() => Date)
  @CreateDateColumn({
    type: 'timestamp with time zone',
  })
  createdAt: Date;

  @Field(() => Date)
  @UpdateDateColumn({
    type: 'timestamp with time zone',
  })
  updatedAt: Date;

  @Field(() => [Place], { nullable: true })
  @OneToMany(() => Place, (place) => place.user, {
    nullable: true,
  })
  place: Place[];

  @BeforeInsert()
  @BeforeUpdate()
  async beforeInsertOrUpdate() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, BCRYPT_HASH_ROUNDS);
    }
  }

  @BeforeInsert()
  beforeInsert() {
    if (!this.role) {
      this.role = 'user';
    }
  }
}

@ObjectType()
export class GetUserType {
  @Field(() => [User], { nullable: true })
  data?: User[];

  @Field(() => Number, { nullable: true })
  count?: number;
}
