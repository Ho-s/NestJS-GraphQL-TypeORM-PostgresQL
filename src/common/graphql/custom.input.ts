import { Field, InputType, Int } from '@nestjs/graphql';

import { IsNotEmpty, IsOptional } from 'class-validator';
import GraphQLJSON from 'graphql-type-json';
import { FindOptionsOrder } from 'typeorm';

import { IWhere } from './utils/types';

const WHERE_DESCRIPTION =
  '{key: value} for equality, or {key: {operator: value}}. Operators: $eq, $ne, $lt, $lte, $gt, $gte, $in, $nIn, $between, $contains, $nContains, $iContains, $nIContains, $null, $nNull. Sibling keys are joined with AND, a top level array is joined with OR. null means IS NULL. See process-where.md';

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
  @Field(() => GraphQLJSON, { description: WHERE_DESCRIPTION })
  @IsNotEmpty()
  where: IWhere<T>;
}

@InputType()
export class GetManyInput<T> {
  @Field(() => GraphQLJSON, {
    nullable: true,
    description: WHERE_DESCRIPTION,
  })
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
