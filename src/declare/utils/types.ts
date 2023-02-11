import { FindOptionsWhereProperty } from 'typeorm';

// equal
// where:{user:{id:3}}

// Not equal
//where:{user:{id:{$ne:3}}}
type TNe = {
  $ne: unknown;
};

// Less than
//where:{user:{id:{$lt:3}}}
type TLt = {
  $lt: number | Date;
};

// Less than or equal
//where:{user:{id:{$lte:3}}}
type TLte = {
  $lte: number | Date;
};

// Greater than
//where:{user:{id:{$gt:3}}}
type TGt = {
  $gt: number | Date;
};

// Greater than or equal
//where:{user:{id:{$gte:3}}}
type TGte = {
  $gte: number | Date;
};

// In
//where:{user:{id:{$in:[1,2,3]}}}
type TIn<T> = {
  $in: T[keyof T][];
};

// Not in
//where:{user:{id:{$nIn:[1,2,3]}}}
type TNotIn = {
  $nIn: unknown[];
};

// Contains(Case-sensitive)
//where:{user:{id:{$contains:"3"}}}
type TContains = {
  $contains: string | number;
};

// Not contains(Case-sensitive)
//where:{user:{id:{$nContains:"3"}}}
type TNotContains = {
  $nContains: unknown;
};

// Contains(Case-insensitive)
//where:{user:{id:{$icontains:"3"}}}
type TIContains = {
  $iContains: string | number;
};

// Not contains(Case-insensitive)
//where:{user:{id:{$icontains:"3"}}}
type TNotIContains = {
  $nIContains: unknown;
};

// Is null
//where:{user:{id:{$null:true}}}
type TNull = {
  $null: boolean;
};

// Is not null
//where:{user:{id:{$notNull:true}}}
type TNotNull = {
  $nNull: boolean;
};

// Is between
//where:{user:{id:{$between:[1,3]}}}
type TBetween = {
  $between: [number, number] | [Date, Date] | [string, string];
};

// Joins the filters in an "or" expression
// where:[{user:{id:3}},{user:{id:4}}]

// Joins the filters in an "and" expression
// where:{user:{id:3,name:"test"},tile:{id:4}}

export type OperatorType<T> =
  | TNe
  | TLt
  | TLte
  | TGt
  | TGte
  | TIn<T>
  | TNotIn
  | TContains
  | TNotContains
  | TNull
  | TNotNull
  | TBetween
  | TIContains
  | TNotIContains;

type ExtendedFindOptionsWhere<Entity> = {
  [P in keyof Entity]?: P extends 'toString'
    ? unknown
    :
        | FindOptionsWhereProperty<NonNullable<Entity[P]>>
        | OperatorType<Entity>
        | Entity[P]
        | ExtendedFindOptionsWhere<Entity>;
};

export type IWhere<T> =
  | ExtendedFindOptionsWhere<T>
  | ExtendedFindOptionsWhere<T>[];
