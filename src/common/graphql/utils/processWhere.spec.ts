import { BadRequestException } from '@nestjs/common';

import { FindOperator } from 'typeorm';

import { processWhere } from './processWhere';
import { IWhere } from './types';

type Target = {
  id: string;
  name: string;
  age: number;
  user: { id: string; profile: { name: string } };
};

const run = (where: IWhere<Target>) =>
  processWhere(where) as Record<string, any>;

const operatorOf = (value: unknown) => {
  expect(value).toBeInstanceOf(FindOperator);
  return value as FindOperator<unknown>;
};

describe('processWhere', () => {
  describe('plain values', () => {
    it('passes a scalar through untouched', () => {
      expect(run({ name: 'a' })).toEqual({ name: 'a' });
    });

    it('merges sibling keys into a single condition', () => {
      expect(run({ name: 'a', age: 1 })).toEqual({ name: 'a', age: 1 });
    });

    it('keeps every sibling of a nested and', () => {
      expect(run({ user: { id: 'x', name: 'y' } } as IWhere<Target>)).toEqual({
        user: { id: 'x', name: 'y' },
      });
    });

    it('keeps every sibling two levels down', () => {
      expect(
        run({ user: { profile: { first: 'a', last: 'b' } } } as IWhere<Target>),
      ).toEqual({ user: { profile: { first: 'a', last: 'b' } } });
    });

    it('keeps a top level sibling alongside a nested one', () => {
      expect(
        run({ id: 'a', user: { id: 'x', name: 'y' } } as IWhere<Target>),
      ).toEqual({ id: 'a', user: { id: 'x', name: 'y' } });
    });

    it('does not merge sibling find operators into each other', () => {
      const result = run({
        name: { $in: ['a'] },
        age: { $gt: 1 },
      } as IWhere<Target>);

      expect(operatorOf(result.name).type).toBe('in');
      expect(operatorOf(result.age).type).toBe('moreThan');
    });

    it('keeps an or expression as an array', () => {
      const result = processWhere<Target>([{ name: 'a' }, { name: 'b' }]);

      expect(Array.isArray(result)).toBe(true);
      expect(result).toEqual([{ name: 'a' }, { name: 'b' }]);
    });
  });

  describe('comparison operators', () => {
    it.each([
      ['$ne', 'not'],
      ['$lt', 'lessThan'],
      ['$lte', 'lessThanOrEqual'],
      ['$gt', 'moreThan'],
      ['$gte', 'moreThanOrEqual'],
    ])('maps %s to %s', (operator, type) => {
      const result = run({ age: { [operator]: 1 } } as IWhere<Target>);

      expect(operatorOf(result.age).type).toBe(type);
    });

    it('maps $eq to the raw value', () => {
      expect(run({ age: { $eq: 1 } } as IWhere<Target>)).toEqual({ age: 1 });
    });

    it('maps $in to in', () => {
      const result = run({ name: { $in: ['a', 'b'] } } as IWhere<Target>);

      expect(operatorOf(result.name).type).toBe('in');
      expect(operatorOf(result.name).value).toEqual(['a', 'b']);
    });

    it('maps $between to between', () => {
      const result = run({ age: { $between: [1, 9] } } as IWhere<Target>);

      expect(operatorOf(result.age).type).toBe('between');
      expect(operatorOf(result.age).value).toEqual([1, 9]);
    });

    it.each([
      ['$contains', 'like'],
      ['$iContains', 'ilike'],
    ])('maps %s to a wrapped %s', (operator, type) => {
      const result = run({ name: { [operator]: 'ab' } } as IWhere<Target>);

      expect(operatorOf(result.name).type).toBe(type);
      expect(operatorOf(result.name).value).toBe('%ab%');
    });

    it.each(['$nIn', '$nContains', '$nIContains'])(
      'wraps %s in not',
      (operator) => {
        const value = operator === '$nIn' ? ['a'] : 'a';
        const result = run({ name: { [operator]: value } } as IWhere<Target>);

        expect(operatorOf(result.name).type).toBe('not');
      },
    );
  });

  describe('null handling', () => {
    it('turns a bare null into isNull', () => {
      expect(operatorOf(run({ name: null } as IWhere<Target>).name).type).toBe(
        'isNull',
      );
    });

    it('turns $eq null into isNull', () => {
      const result = run({ name: { $eq: null } } as IWhere<Target>);

      expect(operatorOf(result.name).type).toBe('isNull');
    });

    it('turns $ne null into not isNull', () => {
      const result = run({ name: { $ne: null } } as IWhere<Target>);

      expect(operatorOf(result.name).type).toBe('not');
      expect(operatorOf(result.name).child.type).toBe('isNull');
    });

    it.each([
      ['$eq', 'isNull'],
      ['$ne', 'not'],
      ['$null', 'isNull'],
      ['$nNull', 'not'],
    ])('accepts null for %s and builds %s', (operator, type) => {
      const result = run({ name: { [operator]: null } } as IWhere<Target>);

      expect(operatorOf(result.name).type).toBe(type);
    });

    it('turns a nested null into isNull', () => {
      const result = run({ user: { id: null } } as IWhere<Target>);

      expect(operatorOf(result.user.id).type).toBe('isNull');
    });

    it('turns a nested $eq null into isNull', () => {
      const result = run({
        user: { id: { $eq: null } },
      } as IWhere<Target>);

      expect(operatorOf(result.user.id).type).toBe('isNull');
    });

    it('keeps a nested null under its own key', () => {
      const result = run({
        user: { id: null, name: 'y' },
      } as IWhere<Target>);

      expect(operatorOf(result.user.id).type).toBe('isNull');
      expect(result.user.name).toBe('y');
    });

    it('never leaks a raw null into the condition', () => {
      const result = run({
        user: { profile: { name: null } },
      } as IWhere<Target>);

      expect(JSON.stringify(result)).not.toContain(':null');
    });
  });

  describe('rejected input', () => {
    it('rejects an empty where', () => {
      expect(() => run({})).toThrow(BadRequestException);
    });

    it('rejects an empty nested where', () => {
      expect(() => run({ user: {} } as IWhere<Target>)).toThrow(
        BadRequestException,
      );
    });

    it('rejects an unknown operator', () => {
      expect(() => run({ age: { $nope: 1 } } as IWhere<Target>)).toThrow(
        /Invalid operator \$nope/,
      );
    });

    it.each(['$in', '$nIn'])('rejects a non-array for %s', (operator) => {
      expect(() =>
        run({ name: { [operator]: 'a' } } as IWhere<Target>),
      ).toThrow(/needs an array/);
    });

    it('rejects an array containing null', () => {
      expect(() =>
        run({ name: { $in: ['a', null] } } as IWhere<Target>),
      ).toThrow(/needs an array without null/);
    });

    it('rejects $between without exactly two values', () => {
      expect(() => run({ age: { $between: [1] } } as IWhere<Target>)).toThrow(
        /needs exactly two values/,
      );
    });

    it.each([
      '$lt',
      '$lte',
      '$gt',
      '$gte',
      '$in',
      '$nIn',
      '$contains',
      '$nContains',
      '$iContains',
      '$nIContains',
      '$between',
    ])('rejects null for %s', (operator) => {
      expect(() =>
        run({ name: { [operator]: null } } as IWhere<Target>),
      ).toThrow(BadRequestException);
    });
  });
});
