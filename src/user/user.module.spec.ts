import { Test, TestingModule } from '@nestjs/testing';
import { DataType, IBackup, newDb } from 'pg-mem';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { v4 } from 'uuid';
import { join } from 'path';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { UserModule } from './user.module';
import * as request from 'supertest';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ConfigModule } from '@nestjs/config';
import { getEnvPath } from '../common/helper/env.helper';
import { formatError } from 'src/common/format/graphql-error.format';
import GraphQLJSON from 'graphql-type-json';
import { AuthModule } from 'src/auth/auth.module';
import { GraphqlPassportAuthGuard } from 'src/common/guards/graphql-passport-auth.guard';
import { CreateUserInput, UpdateUserInput } from './inputs/user.input';
import { GetOneInput } from 'src/common/graphql/custom.input';

describe('UserModule', () => {
  // let backup: IBackup;
  let app: INestApplication;
  let savedId: string;

  beforeAll(async () => {
    const db = newDb({
      autoCreateForeignKeyIndices: true,
    });

    // To implement custom function
    db.public.registerFunction({
      name: 'current_database',
      implementation: () => 'test',
    });

    // To implement custom function
    db.public.registerFunction({
      name: 'version',
      implementation: () => 'user',
    });

    db.registerExtension('uuid-ossp', (schema) => {
      schema.registerFunction({
        name: 'uuid_generate_v4',
        returns: DataType.uuid,
        implementation: v4,
        impure: true,
      });
    });

    const datasource = await db.adapters.createTypeormDataSource({
      type: 'postgres',
      entities: [join(process.cwd(), 'src', '**', '*.entity.{ts,js}')],
      autoLoadEntities: true,
    });

    await datasource.initialize();

    await datasource.synchronize();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(),
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: getEnvPath(process.cwd()),
        }),
        GraphQLModule.forRootAsync<ApolloDriverConfig>({
          driver: ApolloDriver,
          useFactory: () => ({
            context: ({ req }) => ({ req }),
            cache: 'bounded',
            formatError,
            resolvers: { JSON: GraphQLJSON },
            autoSchemaFile: join(process.cwd(), 'test/graphql-schema.gql'),
            sortSchema: true,
          }),
        }),
        UserModule,
        AuthModule,
      ],
    })
      .overrideProvider(DataSource)
      .useValue(datasource)
      .overrideGuard(GraphqlPassportAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = module.createNestApplication();

    await app.init();

    // To make each test run independently, remove these comments below
    // backup = db.backup();
  });

  // afterEach(async () => {
  // backup.restore();
  // });

  afterAll(async () => {
    await app.close();
  });

  const created = {
    username: 'someusername',
    nickname: 'somenickname',
    role: 'user',
  };

  it('create', async () => {
    const keyName = 'createUser';

    const gqlQuery = {
      query: `
        mutation ($input: ${CreateUserInput.prototype.constructor.name}!) {
          ${keyName}(input: $input) {
            id
            ${Object.keys(created).join('\n')}
          }
        }
      `,
      variables: {
        input: { ...created, password: 'somepassword' },
      },
    };

    await request(app.getHttpServer())
      .post('/graphql')
      .send(gqlQuery)
      .set('Content-Type', 'application/json')
      .expect(HttpStatus.OK)
      .expect(({ body: { data } }) => {
        const { id } = data[keyName];
        savedId = id;
        expect(data[keyName]).toMatchObject(created);
      });
  });

  it('getMany', async () => {
    const keyName = 'getManyUserList';

    const gqlQuery = {
      query: `
        query {
          ${keyName}{
            data {
              ${Object.keys(created).join('\n')}
            }
          }
        }
      `,
    };

    await request(app.getHttpServer())
      .post('/graphql')
      .send(gqlQuery)
      .set('Content-Type', 'application/json')
      .expect(HttpStatus.OK)
      .expect(({ body: { data } }) => {
        expect(data[keyName]).toMatchObject({ data: [created] });
      });
  });

  it('getOne', async () => {
    const keyName = 'getOneUser';

    const gqlQuery = {
      query: `
        query ($input: ${GetOneInput.prototype.constructor.name}!) {
          ${keyName} (input:$input) {
            ${Object.keys(created).join('\n')}
          }
        }
      `,
      variables: {
        input: {
          where: created,
        },
      },
    };

    await request(app.getHttpServer())
      .post('/graphql')
      .send(gqlQuery)
      .set('Content-Type', 'application/json')
      .expect(HttpStatus.OK)
      .expect(({ body: { data } }) => {
        expect(data[keyName]).toMatchObject(created);
      });
  });

  it('update', async () => {
    const keyName = 'updateUser';

    const gqlQuery = {
      query: `
        mutation ($id: String!, $input: ${UpdateUserInput.prototype.constructor.name}!) {
          ${keyName}(id: $id, input: $input)
        }
      `,
      variables: {
        id: savedId,
        input: {
          username: 'changedusername',
        },
      },
    };

    await request(app.getHttpServer())
      .post('/graphql')
      .send(gqlQuery)
      .set('Content-Type', 'application/json')
      .expect(HttpStatus.OK)
      .expect(({ body: { data } }) => {
        expect(data[keyName].affected).toBe(1);
      });
  });

  it('delete', async () => {
    const keyName = 'deleteUser';

    const gqlQuery = {
      query: `
        mutation ($id: String!) {
          ${keyName}(id: $id)
        }
      `,
      variables: {
        id: savedId,
      },
    };

    await request(app.getHttpServer())
      .post('/graphql')
      .send(gqlQuery)
      .set('Content-Type', 'application/json')
      .expect(HttpStatus.OK)
      .expect(({ body: { data } }) => {
        expect(data[keyName].affected).toBe(1);
      });
  });
});
