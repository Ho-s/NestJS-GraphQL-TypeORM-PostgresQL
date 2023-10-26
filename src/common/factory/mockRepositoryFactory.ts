import { ExtendedRepository } from 'src/common/graphql/customExtended';
import { Repository } from 'typeorm';

export type MockRepository<T = unknown> = Partial<
  Record<keyof ExtendedRepository<T>, jest.Mock>
>;

export class MockRepositoryFactory {
  static getMockRepository<T>(
    repository: new (...args: unknown[]) => T,
  ): MockRepository<T> {
    return [
      ...Object.getOwnPropertyNames(Repository.prototype),
      ...Object.getOwnPropertyNames(ExtendedRepository.prototype),
      ...Object.getOwnPropertyNames(repository.prototype),
    ]
      .filter((key: string) => key !== 'constructor')
      .reduce((fncs, key: string) => {
        fncs[key] = jest.fn();
        return fncs;
      }, {});
  }
}
