import { Test, TestingModule } from '@nestjs/testing';

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
    const qs: GetManyInput<User> = {
      where: { id: utilService.getRandomUUID },
    };

    const gqlQuery = `
      query GetManyUserList {
        getManyUserList {
          data {
            id
          }
        }
      }
    `;

    expect(resolver.getManyUserList(qs, gqlQuery)).not.toEqual(null);
    expect(mockedService.getMany).toHaveBeenCalledWith(qs, gqlQuery);
  });

  it('Calling "Get one user list" method', () => {
    const qs: GetOneInput<User> = {
      where: { id: utilService.getRandomUUID },
    };

    const gqlQuery = `
    query GetOneUser ($input: GetOneInput!) {
      getOneUser (input:$input) {
          id
        }
      }
    `;

    expect(resolver.getOneUser(qs, gqlQuery)).not.toEqual(null);
    expect(mockedService.getOne).toHaveBeenCalledWith(qs, gqlQuery);
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

    expect(resolver.getMe(user)).not.toEqual(null);
    expect(mockedService.getOne).toHaveBeenCalledWith({
      where: { id: user.id },
    });
  });
});
