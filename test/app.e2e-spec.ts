import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import * as request from 'supertest';

import { AppModule } from 'src/app.module';
import { SignInInput, SignUpInput } from 'src/auth/inputs/auth.input';
import { UserRole } from 'src/user/entities/user.entity';

const TEST = 'test';
const userInfo = {
  username: TEST,
  nickname: TEST,
};

const password = {
  password: TEST,
};

describe('Container Test (e2e)', () => {
  let app: INestApplication;
  let savedJwt: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('Health Check', () => {
    return request(app.getHttpServer()).get('/health').expect(HttpStatus.OK);
  });

  it('Sign Up', async () => {
    const keyName = 'signUp';

    const gqlQuery = {
      query: `
        mutation ($input: ${SignUpInput.prototype.constructor.name}!) {
          ${keyName}(input: $input) {
            user{
              role
            }
          }
        }
      `,
      variables: {
        input: {
          ...userInfo,
          ...password,
        },
      },
    };

    await request(app.getHttpServer())
      .post('/graphql')
      .send(gqlQuery)
      .set('Content-Type', 'application/json')
      .expect(HttpStatus.OK)
      .expect(({ body: { data } }) => {
        expect(data[keyName]).toMatchObject({ user: { role: UserRole.USER } });
      });
  });

  it('Sign In', async () => {
    const keyName = 'signIn';

    const gqlQuery = {
      query: `
        mutation ($input: ${SignInInput.prototype.constructor.name}!) {
          ${keyName}(input: $input) {
            jwt
          }
        }
      `,
      variables: {
        input: {
          username: userInfo.username,
          ...password,
        },
      },
    };

    await request(app.getHttpServer())
      .post('/graphql')
      .send(gqlQuery)
      .set('Content-Type', 'application/json')
      .expect(HttpStatus.OK)
      .expect(({ body: { data } }) => {
        const { jwt } = data[keyName];
        savedJwt = jwt;
        expect(data[keyName]).toHaveProperty('jwt');
      });
  });

  it('Get Me', async () => {
    const keyName = 'getMe';

    const gqlQuery = {
      query: `
        query {
          ${keyName} {
            ${Object.keys(userInfo).join('\n')}
          }
        }
      `,
    };

    await request(app.getHttpServer())
      .post('/graphql')
      .send(gqlQuery)
      .set('Content-Type', 'application/json')
      .set('Authorization', 'Bearer ' + savedJwt)
      .expect(HttpStatus.OK)
      .expect(({ body: { data } }) => {
        expect(data[keyName]).toMatchObject(userInfo);
      });
  });
});
