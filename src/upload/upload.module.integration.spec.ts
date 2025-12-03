import { HttpModule } from '@nestjs/axios';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Query, Resolver } from '@nestjs/graphql';
import { Test, TestingModule } from '@nestjs/testing';

import { S3 } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import * as request from 'supertest';

import { getEnvPath } from 'src/common/helper/env.helper';

import { UploadService } from './upload.service';

jest.mock('@aws-sdk/client-s3');
jest.mock('@aws-sdk/lib-storage');

@Resolver()
class DummyResolver {
  @Query(() => String)
  _dummy(): string {
    return 'dummy';
  }
}

describe('UploadModule', () => {
  let app: INestApplication;
  let mockS3Send: jest.Mock;

  beforeAll(async () => {
    mockS3Send = jest.fn();
    (S3 as jest.Mock).mockImplementation(() => ({
      send: mockS3Send,
    }));

    (Upload as unknown as jest.Mock).mockImplementation(() => ({
      done: jest.fn().mockResolvedValue({}),
    }));

    const { ApolloDriver } = await import('@nestjs/apollo');
    const { GraphQLModule } = await import('@nestjs/graphql');
    const { UploadResolver } = await import('./upload.resolver');

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: getEnvPath(process.cwd()),
        }),
        GraphQLModule.forRoot({
          driver: ApolloDriver,
          autoSchemaFile: true,
        }),
        HttpModule.register({}),
      ],
      providers: [UploadService, UploadResolver, DummyResolver],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deleteFiles', async () => {
    const keyName = 'deleteFiles';

    mockS3Send
      .mockResolvedValueOnce({ Contents: [{ Key: 'folder/file1.png' }] })
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ Contents: [{ Key: 'folder/file2.png' }] })
      .mockResolvedValueOnce({});

    const gqlQuery = {
      query: `
        mutation ($keys: [String!]!) {
          ${keyName}(keys: $keys)
        }
      `,
      variables: {
        keys: [
          'https://test-bucket.s3.amazonaws.com/folder/file1.png',
          'https://test-bucket.s3.amazonaws.com/folder/file2.png',
        ],
      },
    };

    await request(app.getHttpServer())
      .post('/graphql')
      .send(gqlQuery)
      .set('Content-Type', 'application/json')
      .expect(HttpStatus.OK)
      .expect(({ body: { data } }) => {
        expect(data[keyName]).toBe(true);
      });
  });
});
