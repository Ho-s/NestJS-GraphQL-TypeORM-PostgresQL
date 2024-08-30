import { Field, InputType, Int } from '@nestjs/graphql';

import { IsNotEmpty, IsOptional } from 'class-validator';
import GraphQLJSON from 'graphql-type-json';
import { FindOptionsOrder } from 'typeorm';

import { IWhere } from './utils/types';

@InputType()
export class IPagination {
  @Field(() => Int, { description: 'Started from 0' })
  @IsNotEmpty()
  page: number;

  @Field(() => Int, { description: 'Size of page' })
  @IsNotEmpty()
  size: number;
}

@InputType()
export class GetOneInput<T> {
  @Field(() => GraphQLJSON)
  @IsNotEmpty()
  where: IWhere<T>;
}

@InputType()
export class GetManyInput<T> {
  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  where?: IWhere<T>;

  @Field(() => IPagination, { nullable: true })
  @IsOptional()
  pagination?: IPagination;

  @Field(() => GraphQLJSON, {
    nullable: true,
    description:
      '{key: "ASC" or "DESC" or "asc" or "desc" or 1 or -1} or {key: {direction: "ASC" or "DESC" or "asc" or "desc", nulls: "first" or "last" or "FIRST" or "LAST"}}}',
  })
  @IsOptional()
  order?: FindOptionsOrder<T>;
}
