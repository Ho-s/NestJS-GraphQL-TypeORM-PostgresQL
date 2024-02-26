import {
  FindOptionsRelations,
  FindOptionsSelect,
  FindOptionsWhereProperty,
} from 'typeorm';

// You can see detail operations usage in process-where.md in root

// Not equal
type TNe = {
  $ne: unknown;
};

// Less than
type TLt = {
  $lt: number | Date;
};

// Less than or equal
type TLte = {
  $lte: number | Date;
};

// Greater than
type TGt = {
  $gt: number | Date;
};

// Greater than or equal
type TGte = {
  $gte: number | Date;
};

// In
type TIn<T> = {
  $in: T[keyof T][];
};

// Not in
type TNotIn = {
  $nIn: unknown[];
};

// Contains(Case-sensitive)
type TContains = {
  $contains: string | number;
};

// Not contains(Case-sensitive)
type TNotContains = {
  $nContains: unknown;
};

// Contains(Case-insensitive)
type TIContains = {
  $iContains: string | number;
};

// Not contains(Case-insensitive)
type TNotIContains = {
  $nIContains: unknown;
};

// Is null
type TNull = {
  $null: boolean;
};

// Is not null
type TNotNull = {
  $nNull: boolean;
};

// Is between
type TBetween = {
  $between: [number, number] | [Date, Date] | [string, string];
};

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

export interface GetInfoFromQueryProps<Entity> {
  relations: FindOptionsRelations<Entity>;
  select: FindOptionsSelect<Entity>;
}

export interface AddKeyValueInObjectProps<Entity>
  extends GetInfoFromQueryProps<Entity> {
  stack: string[];
  expandRelation?: boolean;
  hasCountType?: boolean;
}
