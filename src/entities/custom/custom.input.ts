import { IsOptional } from 'class-validator';
import GraphQLJSON from 'graphql-type-json';
import { Field, InputType } from '@nestjs/graphql';
import {
  IDataType,
  IRelation,
  IPagination,
  IOrder,
} from '../../declare/declare.module';
import { IWhere } from 'src/util/processWhere';

@InputType()
export class GetOneInput<T> {
  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  where?: IWhere<T>;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  relations?: IRelation<T>;
}

@InputType()
export class GetManyInput<T> extends GetOneInput<T> {
  @Field(() => IPagination, { nullable: true })
  @IsOptional()
  pagination?: IPagination;

  @Field(() => GraphQLJSON, {
    nullable: true,
    description: '{[key of entity]: "ASC or DESC"}',
  })
  @IsOptional()
  order?: IOrder<T>;

  @Field(() => String, {
    nullable: true,
    description: 'count or data or all, default = data',
  })
  @IsOptional()
  dataType?: IDataType;
}
