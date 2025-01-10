import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import {
  MockRepository,
  MockRepositoryFactory,
} from 'src/common/factory/mockFactory';
import { ExtendedRepository } from 'src/common/graphql/customExtended';
import { OneRepoQuery, RepoQuery } from 'src/common/graphql/types';
import { UtilModule } from 'src/common/shared/services/util.module';
import { UtilService } from 'src/common/shared/services/util.service';

import { User } from './entities/user.entity';
import { CreateUserInput, UpdateUserInput } from './inputs/user.input';
import { UserRepository } from './user.repository';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let mockedRepository: MockRepository<ExtendedRepository<User>>;
  let utilService: UtilService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [UtilModule],
      providers: [
        UserService,
        {
          provide: getRepositoryToken(UserRepository),
          useFactory: MockRepositoryFactory.getMockRepository(UserRepository),
        },
      ],
    }).compile();

    utilService = module.get<UtilService>(UtilService);
    service = module.get<UserService>(UserService);
    mockedRepository = module.get<MockRepository<ExtendedRepository<User>>>(
      getRepositoryToken(UserRepository),
    );
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('Calling "Get many" method', () => {
    const option: RepoQuery<User> = {
      where: { id: utilService.getRandomUUID },
    };

    expect(service.getMany(option)).not.toEqual(null);
    expect(mockedRepository.getMany).toHaveBeenCalled();
  });

  it('Calling "Get one" method', () => {
    const option: OneRepoQuery<User> = {
      where: { id: utilService.getRandomUUID },
    };

    expect(service.getOne(option)).not.toEqual(null);
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
    const id = utilService.getRandomUUID;
    const dto = new UpdateUserInput();
    const user = mockedRepository.create(dto);

    service.update(id, dto);

    expect(mockedRepository.create).toHaveBeenCalledWith(dto);
    expect(mockedRepository.update).toHaveBeenCalledWith(id, user);
  });

  it('Calling "Delete" method', () => {
    const id = utilService.getRandomUUID;

    service.delete(id);

    expect(mockedRepository.delete).toHaveBeenCalledWith({ id });
  });
});
