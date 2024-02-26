import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import {
  MockRepository,
  MockRepositoryFactory,
} from 'src/common/factory/mockFactory';
import { ExtendedRepository } from 'src/common/graphql/customExtended';
import { OneRepoQuery, RepoQuery } from 'src/common/graphql/types';
import { getRandomUUID } from 'src/util/getRandomUUID';

import { User } from './entities/user.entity';
import { CreateUserInput, UpdateUserInput } from './inputs/user.input';
import { UserRepository } from './user.repository';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let mockedRepository: MockRepository<ExtendedRepository<User>>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(UserRepository),
          useFactory: MockRepositoryFactory.getMockRepository(UserRepository),
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    mockedRepository = module.get<MockRepository<ExtendedRepository<User>>>(
      getRepositoryToken(UserRepository),
    );
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('Calling "Get many" method', () => {
    const qs: RepoQuery<User> = {
      where: { id: getRandomUUID() },
    };

    expect(service.getMany(qs)).not.toEqual(null);
    expect(mockedRepository.getMany).toHaveBeenCalled();
  });

  it('Calling "Get one" method', () => {
    const qs: OneRepoQuery<User> = {
      where: { id: getRandomUUID() },
    };

    expect(service.getOne(qs)).not.toEqual(null);
    expect(mockedRepository.getOne).toHaveBeenCalled();
  });

  it('Calling "Create" method', () => {
    const dto = new CreateUserInput();
    const user = mockedRepository.create(dto);

    expect(service.create(dto)).not.toEqual(null);
    expect(mockedRepository.create).toHaveBeenCalledWith(dto);
    expect(mockedRepository.save).toHaveBeenCalledWith(user);
  });

  it('Calling "Update" method', () => {
    const id = getRandomUUID();
    const dto = new UpdateUserInput();
    const user = mockedRepository.create(dto);

    service.update(id, dto);

    expect(mockedRepository.create).toHaveBeenCalledWith(dto);
    expect(mockedRepository.update).toHaveBeenCalledWith(id, user);
  });

  it('Calling "Delete" method', () => {
    const id = getRandomUUID();

    service.delete(id);

    expect(mockedRepository.delete).toHaveBeenCalledWith({ id });
  });
});
