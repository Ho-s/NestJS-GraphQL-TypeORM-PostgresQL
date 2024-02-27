import { Repository } from 'typeorm';

import { ExtendedRepository } from 'src/common/graphql/customExtended';

const putMockedFunction = (propsNames: string[]) => {
  return propsNames
    .filter((key: string) => key !== 'constructor')
    .reduce((fncs, key: string) => {
      fncs[key] = jest.fn();
      return fncs;
    }, {});
};

export type MockRepository<T = unknown> = Partial<
  Record<keyof ExtendedRepository<T>, jest.Mock>
>;

export class MockRepositoryFactory {
  static getMockRepository<T>(
    repository: new (...args: unknown[]) => T,
  ): () => MockRepository<T> {
    return () =>
      putMockedFunction([
        ...Object.getOwnPropertyNames(Repository.prototype),
        ...Object.getOwnPropertyNames(ExtendedRepository.prototype),
        ...Object.getOwnPropertyNames(repository.prototype),
      ]);
  }
}

export type MockService<T = unknown> = Partial<Record<keyof T, jest.Mock>>;

export class MockServiceFactory {
  static getMockService<T>(
    service: new (...args: unknown[]) => T,
  ): () => MockService<T> {
    return () =>
      putMockedFunction(Object.getOwnPropertyNames(service.prototype));
  }
}
