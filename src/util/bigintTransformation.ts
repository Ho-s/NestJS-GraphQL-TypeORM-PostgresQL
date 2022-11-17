import { ValueTransformer } from 'typeorm';

export const bigintTransformation: ValueTransformer = {
  to: (entityValue: number) => entityValue?.toString(),
  from: (databaseValue: string): number =>
    databaseValue ? parseInt(databaseValue, 10) : null,
};
