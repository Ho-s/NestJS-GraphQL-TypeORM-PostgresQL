# NestJS/TypeORM/GraphQL/PostgreSQL

NestJS boilerplate with TypeORM, GraphQL and PostgreSQL

## Table of Contents

- [1. Open for Contribution](#1-open-for-contribution)

- [2. Getting Started](#2-getting-started)

  - [2.1. Installation](#21-installation)
  - [2.2. Run](#22-run)

- [3. Docker](#3-docker)

  - [3.1. Docker Compose Installation](#31-docker-compose-installation)
  - [3.2. Before Getting Started](#32-before-getting-started)
  - [3.3. Run](#33-run)
  - [3.4. Note](#34-note)
  - [3.5. Run Only Database (Local Dev)](#35-run-only-database-local-dev)

- [4. NestJS](#4-nestjs)

- [5. PostgreSQL Database](#5-postgresql-database)

- [6. TypeORM](#6-typeorm)

  - [6.1. Migration Setup and Usage](#61-migration-setup-and-usage)

- [7. GraphQL](#7-graphql)

  - [7.1. Protected Queries/Mutation By Role](#71-protected-queriesmutation-by-role)
  - [7.2. GraphQL Query To Select and Relations](#72-graphql-query-to-select-and-relations)
  - [7.3. Field-Level Permission](#73-field-level-permission)

- [8. Custom CRUD](#8-custom-crud)

- [9. Code generator](#9-code-generator)

- [10. Caching](#10-caching)

  - [10.1. How To Use](#101-how-to-use)

- [11. TDD](#11-tdd)

  - [11.1. Introduction](#111-introduction)
  - [11.2. Before Getting Started](#112-before-getting-started)
  - [11.3. Unit Test (with mock)](#113-unit-test-with-mock)
  - [11.4. Integration Test (with in-memory DB)](#114-integration-test-with-in-memory-db)
  - [11.5. End To End Test (with docker)](#115-end-to-end-test-with-docker)

- [12. CI](#12-ci)

  - [12.1. Github Actions](#121-github-actions)
  - [12.2. Husky v9](#122-husky-v9)

- [13. SWC Compiler](#13-swc-compiler)

  - [13.1. SWC + Jest error resolution](#131-swc--jest-error-resolution)

- [14. Todo](#14-todo)

- [15. License](#15-license)

## 1. Open for Contribution

Totally open for any Pull Request, please feel free to contribute in any ways.
There can be errors related with type or something. It would be very helpful to me for you to fix these errors.

## 2. Getting Started

### 2.1. Installation

Before you start, make sure you have a recent version of [NodeJS](http://nodejs.org/) environment _>=14.0_ with NPM 6 or Yarn.

The first thing you will need is to install NestJS CLI.

```bash
$ yarn -g @nestjs/cli
```

And do install the dependencies

```bash
$ yarn install # or npm install
```

### 2.2. Run

for development

```bash
$ yarn dev # or npm run dev
```

for production

```bash
$ yarn build # or npm run build
$ yarn start # or npm run start
```

or run with docker following below

## 3. Docker

### 3.1. Docker Compose Installation

Download docker from [Official website](https://docs.docker.com/compose/install)

### 3.2. Before Getting Started

Before running Docker, you need to create an env file named `.production.env`.
The content should be modified based on `.example.env`.
The crucial point is that DB_HOST must be set to 'postgres'.

### 3.3. Run

Open terminal and navigate to project directory and run the following command.

```bash
# Only for production
$ docker compose --env-file ./.production.env up
```

### 3.4. Note

If you want to use docker, you have to set DB_HOST in .production.env to be `postgres`.
The default set is `postgres`

### 3.5. Run Only Database (Local Dev)

You can just create PostgreSQL by below code, sync with .development.env

```bash
$ docker run -p 5432:5432 --name postgres -e POSTGRES_PASSWORD=1q2w3e4r -d postgres
```

## 4. [NestJS](https://docs.nestjs.com/)

Base NestJS, We like it

## 5. [PostgreSQL Database](https://www.postgresql.org/)

We use PostgreSQL for backend database, The default database that will be used is named 'postgres'
You have to have PostgreSQL Database server before getting started.
You can use [Docker PostgreSQL](https://hub.docker.com/_/postgres) to have server easily

## 6. [TypeORM](https://typeorm.io/)

We use [Nestjs/TypeORM](https://docs.nestjs.com/techniques/database)
In this template, We've been trying not to use `Pure SQL` to make the most of TypeORM.

### 6.1. Migration Setup and Usage

This project uses TypeORM's migration feature to manage database schema changes. Follow the steps below to generate and apply migrations.

> **Note**
>
> 1. The custom `typeorm` command defined in `package.json` is configured for `NODE_ENV=production`.
> 2. Migrations are intended for production use, while `typeorm synchronize` should be used for development purposes.
> 3. You can see the detailed configuration code [here](/src/common/config/ormconfig.ts)
> 4. As you can see from the configuration code, migration files must be located in the subdirectory of `/src/common/database/migrations/${name}`.

#### 6.1.1. Generate a migration file

To reflect new changes in the database, you need to first generate a migration file.

```bash
yarn migration:generate ./src/common/database/migrations/init
```

you can change the name of migration by replacing `init`

#### 6.1.2. Run the Migration

To apply the generated migration to the database, run the following command:

```bash
yarn migration:run
```

#### 6.1.3. Revert a Migration

To roll back the last applied migration, use the following command:

```bash
yarn migration:revert
```

#### 6.1.4. Check Migration Status

To view the current status of your migrations, run:

```bash
yarn migration:show
```

#### 6.1.5. Create Migration Command

You can also directly create a migration file using the following `typeorm` command:

```bash
yarn migration:create ./src/common/database/migrations/init
```

This command generates an empty migration file where you can manually add your schema changes.

## 7. [GraphQL](https://graphql.org/)

##### packages: graphql, apollo-server-express and @nestjs/graphql, [graphqlUpload](https://www.npmjs.com/package/graphql-upload) ...

We use GraphQL in a Code First approach (our code will create the GraphQL Schemas).

We don't use [swagger](https://docs.nestjs.com/openapi/introduction) now, but you can use this if you want to.
You can see [playground](http://localhost:8000/graphql)

We use Apollo Server Playground by default. If you'd prefer the original GraphQL Playground, enable it as follows:

```js
// src/common/config/graphql-config.service.ts

GraphQLModule.forRootAsync <
  ApolloDriverConfig >
  {
    ...
    createGqlOptions(): Promise<ApolloDriverConfig> | ApolloDriverConfig {
      ...
      playground: true,
      ...
    }
    ...
  };
```

### 7.1. Protected Queries/Mutation By Role

Some of the GraphQL queries are protected by a NestJS Guard (`GraphqlPassportAuthGuard`) and requires you to be authenticated (and some also requires to have the Admin role).
You can solve them with Sending JWT token in `Http Header` with the `Authorization`.

```json
# Http Header
{
  "Authorization": "Bearer TOKEN"
}
```

#### 7.1.1. Example Of Some Protected GraphQL

- getMe (must be authenticated)
- All methods generated by the generator (must be authenticated and must be admin)

### 7.2. GraphQL Query To Select and Relations

#### 7.2.1. Dynamic Query Optimization

- Automatically maps GraphQL queries to optimized SELECT and JOIN clauses in TypeORM.

- Ensures that only the requested fields and necessary relations are retrieved, reducing over-fetching and improving performance.

- With using interceptor (name: `UseRepositoryInterceptor`) and paramDecorator (name: `GraphQLQueryToOption`)

#### 7.2.2. How to use

- You can find example code in [/src/user/user.resolver.ts](/src/user/user.resolver.ts)

### 7.3. Field-Level Permission

The [permission guard](/src/common/decorators/query-guard.decorator.ts) is used to block access to specific fields in client requests.

#### 7.3.1. Why it was created

- In GraphQL, clients can request any field, which could expose sensitive information. This guard ensures that sensitive fields are protected.

- It allows controlling access to specific fields based on the server's permissions.

#### 7.3.2. How to use

```ts
@Query(()=>Some)
@UseQueryPermissionGuard(Some, { something: true })
async getManySomeList(){
  return this.someService.getMany()
}
```

With this API, if the client request includes the field "something," a `Forbidden` error will be triggered.

#### 7.3.3. Note

There might be duplicate code when using this guard alongside `other interceptors`(name: `UseRepositoryInterceptor`) in this boilerplate. In such cases, you may need to adjust the code to ensure compatibility.

## 8. Custom CRUD

To make most of GraphQL's advantage, We created its own api, such as GetMany or GetOne.
We tried to make it as comfortable as possible, but if you find any mistakes or improvements, please point them out or promote them.

You can see detail in folder [/src/common/graphql](/src/common/graphql) files

```js
// query
query($input:GetManyInput) {
  getManyPlaces(input:$input){
    data{
      id
      longitude
      count
    }
  }
}
```

```js
// variables
{
  input: {
    pagination: {
      size: 10,
      page: 0, // Started from 0
    },
    order: { id: 'DESC' },
    dataType: 'data', //all or count or data - default: all
    where: {
      id: 3,
    },
  },
};
```

You can see detail [here](./process-where.md).

## 9. Code generator

There is [CRUD Generator in NestJS](https://docs.nestjs.com/recipes/crud-generator).
In this repository, It has its own generator with [plopjs](https://plopjs.com/documentation/).
You can use like below.

```bash
$ yarn g
```

## 10. Caching

This project provides a custom decorator that makes it easy to implement method caching in NestJS applications.

1. **Caching Functionality**: Utilizes `DiscoveryService` and `MetadataScanner` to handle method caching automatically at runtime.
2. **Usage**: Designed for use with any provider.
3. **GraphQL Resolvers**: Resolvers are also part of providers, but due to GraphQL's internal logic, method overrides do not work. Therefore, the functionality has been replaced with an interceptor.

### 10.1. How To Use

```js
@Injectable()
export class ExampleService {
  @Cache(...)
  async exampleMethod(...args: unknown) {
    ...
  }
}
```

You can find related codes [here](./src/cache/custom-cache.module.ts)

## 11. TDD

### 11.1. Introduction

[`@nestjs/testing`](https://docs.nestjs.com/fundamentals/testing) = `supertest` + `jest`

### 11.2. Before Getting Started

Before starting the test, you need to set at least jwt-related environment variables in an env file named `.test.env`.

### 11.3. Unit Test (with mock)

Unit test(with jest mock) for services & resolvers (\*.service.spec.ts & \*.resolver.spec.ts)

#### 11.3.1. Run

```bash
$ yarn test:unit
```

### 11.4. Integration Test (with in-memory DB)

Integration test(with [pg-mem](https://github.com/oguimbal/pg-mem)) for modules (\*.module.spec.ts)

#### 11.4.1. Run

```bash
$ yarn test:integration
```

### 11.5. End To End Test (with docker)

E2E Test(with docker container)

#### 11.5.1. Run

```bash
$ yarn test:e2e:docker
```

## 12. CI

### 12.1. Github Actions

To ensure github actions execution, please set the 'ENV' variable within your github actions secrets as your .test.env configuration.

**Note:** Github Actions does not recognize newline characters. Therefore, you must remove any newline characters from each environment variable value in your `.env` file, ensuring that the entire content is on a single line when setting the Secret. If you need to use an environment variable value that includes newline characters, encode the value using Base64 and store it in the Github Secret, then decode it within the workflow.

ex)

```bash
JWT_PRIVATE_KEY= -----BEGIN RSA PRIVATE KEY-----...MIIEogIBAAKCAQBZ...-----END RSA PRIVATE KEY-----
```

### 12.2. [Husky v9](https://github.com/typicode/husky)

#### 12.2.1 Before Getting Started

```bash
$ yarn prepare
```

#### 12.2.2 Pre commit

[You can check detail here](./.husky/pre-commit)

Before commit, The pre-commit hooks is executed.

Lint checks have been automated to run before a commit is made.

If you want to add test before commit actions, you can add follow line in [pre-commit](./.husky/pre-commit) file.

```bash
...
yarn test
...
```

#### 12.2.3. Pre push

[You can check detail here](./.husky/pre-push)

The pre-push hooks is executed before the push action.

The default rule set in the pre-push hook is to prevent direct pushes to the main branch.

If you want to enable this action, you should uncomment the lines in the pre push file.

## 13. [SWC Compiler](https://docs.nestjs.com/recipes/swc)

[SWC](https://swc.rs/) (Speedy Web Compiler) is an extensible Rust-based platform that can be used for both compilation and bundling. Using SWC with Nest CLI is a great and simple way to significantly speed up your development process.

### 13.1. SWC + Jest error resolution

After applying `SWC`, the following error was displayed in jest using an in-memory database (`pg-mem`):

```bash
    QueryFailedError: ERROR: function obj_description(regclass,text) does not exist
    HINT: 🔨 Please note that pg-mem implements very few native functions.

                👉 You can specify the functions you would like to use via "db.public.registerFunction(...)"

    🐜 This seems to be an execution error, which means that your request syntax seems okay,
        but the resulting statement cannot be executed → Probably not a pg-mem error.

    *️⃣ Failed SQL statement: SELECT "table_schema", "table_name", obj_description(('"' || "table_schema" || '"."' || "table_name" || '"')::regclass, 'pg_class') AS table_comment FROM "information_schema"."tables" WHERE ("table_schema" = 'public' AND "table_name" = 'user');

    👉 You can file an issue at https://github.com/oguimbal/pg-mem along with a way to reproduce this error (if you can), and  the stacktrace:
```

`pg-mem` is a library designed to emulate `PostgreSQL`, however, it does not support all features, which is why the above error occurred.

This error can be resolved by implementing or overriding existing functions. Below is the function implementation for the resolution.
Related issues can be checked [here](https://github.com/oguimbal/pg-mem/issues/380).

```ts
db.public.registerFunction({
  name: 'obj_description',
  args: [DataType.text, DataType.text],
  returns: DataType.text,
  implementation: () => 'test',
});
```

## 14. Todo

- [x] TDD

  - [x] Unit Test (Use mock)
  - [x] Integration Test (Use in-memory DB)
  - [x] End To End Test (Use docker)

- [x] CI

  - [x] Github actions
  - [x] husky

- [x] GraphQL Upload
- [x] Healthcheck
- [x] Divide usefactory
- [x] SWC Compiler
- [x] Refresh Token
- [ ] Redis
- [ ] ElasticSearch
- [x] Caching
- [ ] Graphql Subscription
- [x] Remove lodash
- [ ] [CASL](https://docs.nestjs.com/security/authorization#integrating-casl)

## 15. License

MIT
