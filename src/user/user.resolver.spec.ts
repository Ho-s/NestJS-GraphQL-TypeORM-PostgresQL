import { Test, TestingModule } from '@nestjs/testing';

import { DataSource } from 'typeorm';

import {
  MockService,
  MockServiceFactory,
} from 'src/common/factory/mockFactory';
import { GetManyInput, GetOneInput } from 'src/common/graphql/custom.input';
import { UtilModule } from 'src/common/shared/services/util.module';
import { UtilService } from 'src/common/shared/services/util.service';

import { User } from './entities/user.entity';
import { CreateUserInput, UpdateUserInput } from './inputs/user.input';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';

describe('UserResolver', () => {
  let resolver: UserResolver;
  let mockedService: MockService<UserService>;
  let utilService: UtilService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [UtilModule],
      providers: [
        UserResolver,
        {
          provide: UserService,
          useFactory: MockServiceFactory.getMockService(UserService),
        },
        {
          provide: DataSource,
          useValue: undefined,
        },
      ],
    }).compile();

    utilService = module.get<UtilService>(UtilService);
    resolver = module.get<UserResolver>(UserResolver);
    mockedService = module.get<MockService<UserService>>(UserService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('Calling "Get many user list" method', () => {
    const condition: GetManyInput<User> = {
      where: { id: utilService.getRandomUUID },
    };

    const option = { relations: undefined, select: undefined };

    expect(resolver.getManyUserList(condition, option)).not.toEqual(null);
    expect(mockedService.getMany).toHaveBeenCalledWith({
      ...condition,
      ...option,
    });
  });

  it('Calling "Get one user list" method', () => {
    const condition: GetOneInput<User> = {
      where: { id: utilService.getRandomUUID },
    };

    const option = { relations: undefined, select: undefined };

    expect(resolver.getOneUser(condition, option)).not.toEqual(null);
    expect(mockedService.getOne).toHaveBeenCalledWith({
      ...condition,
      ...option,
    });
  });

  it('Calling "Create user" method', () => {
    const dto = new CreateUserInput();

    expect(resolver.createUser(dto)).not.toEqual(null);
    expect(mockedService.create).toHaveBeenCalledWith(dto);
  });

  it('Calling "Update user" method', () => {
    const id = utilService.getRandomUUID;
    const dto = new UpdateUserInput();

    resolver.updateUser(id, dto);

    expect(mockedService.update).toHaveBeenCalledWith(id, dto);
  });

  it('Calling "Delete user" method', () => {
    const id = utilService.getRandomUUID;

    resolver.deleteUser(id);

    expect(mockedService.delete).toHaveBeenCalledWith(id);
  });

  it('Calling "Get Me" method', () => {
    const user = new User();

    const condition: GetOneInput<User> = { where: { id: user.id } };

    const option = { relations: undefined, select: undefined };

    expect(resolver.getMe(user, option)).not.toEqual(null);
    expect(mockedService.getOne).toHaveBeenCalledWith({
      ...condition,
      ...option,
    });
  });
});
