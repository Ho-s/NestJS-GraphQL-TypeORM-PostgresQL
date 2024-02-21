import fs from 'fs';
import inquirer from 'inquirer';
import readline from 'readline';
import { exec } from 'child_process';
import util from 'util';
import ora from 'ora';

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

const createEntityFileText = (
  name,
  createdAt,
  updatedAt,
  typeOfId,
  coulumn,
  type,
  check,
) => {
  return [
    `import {`,
    `  Column,`,
    `${createdAt ? 'CreateDateColumn,' : ''}`,
    `  Entity,`,
    `  PrimaryGeneratedColumn,`,
    `${updatedAt ? 'UpdateDateColumn,' : ''}`,
    `} from 'typeorm'`,
    `import { Field, ID, ObjectType } from '@nestjs/graphql'`,
    ``,
    `@ObjectType()`,
    `@Entity()`,
    `export class ${capitalize(name)} {`,
    `  @Field(() => ID)`,
    `  @PrimaryGeneratedColumn('${typeOfId}')`,
    `  id: ${typeOfId === 'increment' ? 'number' : 'string'};`,
    ``,
    `  @Field(() => ${capitalize(type)}${
      check === 'optional' ? ', { nullable: true }' : ''
    })`,
    `  @Column(${check === 'optional' ? '{ nullable: true }' : ''})`,
    `  ${coulumn}${check === 'optional' ? '?' : ''}: ${type}`,
    ``,
    ...(createdAt
      ? [
          `  @Field()`,
          `  @CreateDateColumn({`,
          `    type: 'timestamp with time zone',`,
          `  })`,
          `  createdAt: Date;`,
          ``,
        ]
      : []),
    ...(updatedAt
      ? [
          `  @Field()`,
          `  @UpdateDateColumn({`,
          `    type: 'timestamp with time zone',`,
          `  })`,
          `  updatedAt: Date;`,
          ``,
        ]
      : []),
    `}`,
    ``,
    `@ObjectType()`,
    `export class Get${capitalize(name)}Type {`,
    `  @Field(() => [${capitalize(name)}], { nullable: true })`,
    `  data?: ${capitalize(name)}[];`,
    ``,
    `  @Field(() => Number, { nullable: true })`,
    `  count?: number;`,
    `}`,
    ``,
  ].join('\n');
};

const createInputText = (name, coulumn, type, check) => {
  return [
    `import ${
      check === 'optional' ? '{ IsOptional }' : '{ IsNotEmpty, IsOptional }'
    } from 'class-validator'`,
    `import { Field, InputType } from '@nestjs/graphql'`,
    ``,
    `@InputType()`,
    `export class Create${capitalize(name)}Input {`,
    `  @Field(()=>${capitalize(type)}${
      check === 'optional' ? ', { nullable: true }' : ''
    })`,
    `  ${check === 'optional' ? '@IsOptional()' : `@IsNotEmpty()`}`,
    `  ${coulumn}${check === 'optional' ? '?' : ''}: ${type}`,
    `}`,
    ``,
    `@InputType()`,
    `export class Update${capitalize(name)}Input {`,
    `  @Field(()=>${capitalize(type)}${
      check === 'optional' ? ', { nullable: true }' : ''
    })`,
    `  @IsOptional()`,
    `  ${coulumn}${check === 'optional' ? '?' : ''}: ${type}`,
    `}`,
    ``,
  ].join('\n');
};

const createModuleText = (name) => {
  return [
    `import { Module } from '@nestjs/common';`,
    `import { TypeOrmExModule } from 'src/common/modules/typeorm.module'`,
    `import { ${capitalize(name)}Service } from './${name}.service';`,
    `import { ${capitalize(name)}Repository } from './${name}.repository';`,
    `import { ${capitalize(name)}Resolver } from './${name}.resolver';`,
    ``,
    `@Module({`,
    `  imports: [TypeOrmExModule.forCustomRepository([${capitalize(
      name,
    )}Repository])],`,
    `  providers: [${capitalize(name)}Service, ${capitalize(name)}Resolver],`,
    `  exports: [${capitalize(name)}Service],`,
    `})`,
    `export class ${capitalize(name)}Module {}`,
    ``,
  ].join('\n');
};

const createResolverModuleText = (name, typeOfId) => {
  return [
    `import { UseAuthGuard } from 'src/common/decorators/auth-guard.decorator';`,
    `import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'`,
    `import { ${capitalize(name)}Service } from './${name}.service'`,
    `import { GetManyInput, GetOneInput } from 'src/common/graphql/custom.input'`,
    `import { CurrentQuery } from 'src/common/decorators/query.decorator'`,
    `import GraphQLJSON from 'graphql-type-json';`,

    `import { Get${capitalize(name)}Type, ${capitalize(
      name,
    )} } from './entities/${name}.entity';`,
    `import { Create${capitalize(name)}Input, Update${capitalize(
      name,
    )}Input } from './inputs/${name}.input';`,
    `@Resolver()`,
    `export class ${capitalize(name)}Resolver {`,
    `constructor(private readonly ${name}Service: ${capitalize(
      name,
    )}Service) {}`,
    ``,
    `@Query(() => Get${capitalize(name)}Type)`,
    `@UseAuthGuard('admin')`,
    `getMany${capitalize(name)}List(`,
    `  @Args({ name: 'input', nullable: true })`,
    `  qs: GetManyInput<${capitalize(name)}>,`,
    `  @CurrentQuery() gqlQuery: string,`,
    `) {`,
    `  return this.${name}Service.getMany(qs, gqlQuery);`,
    `}`,
    ``,
    `@Query(() => ${capitalize(name)})`,
    `@UseAuthGuard('admin')`,
    `getOne${capitalize(name)}(`,
    `  @Args({ name: 'input' })`,
    `  qs: GetOneInput<${capitalize(name)}>,`,
    `  @CurrentQuery() gqlQuery: string,`,
    `) {`,
    `  return this.${name}Service.getOne(qs, gqlQuery);`,
    `}`,
    ``,
    `@Mutation(() => ${capitalize(name)})`,
    `@UseAuthGuard('admin')`,
    `create${capitalize(name)}(@Args('input') input: Create${capitalize(
      name,
    )}Input) {`,
    `  return this.${name}Service.create(input);`,
    `}`,
    ``,
    `@Mutation(() => GraphQLJSON)`,
    `@UseAuthGuard('admin')`,
    `update${capitalize(name)}(@Args('id') id: ${
      typeOfId === 'increment' ? 'number' : 'string'
    }, @Args('input') input: Update${capitalize(name)}Input) {`,
    `  return this.${name}Service.update(id, input);`,
    `}`,
    ``,
    `@Mutation(() => GraphQLJSON)`,
    `@UseAuthGuard('admin')`,
    `delete${capitalize(name)}(@Args('id') id: ${
      typeOfId === 'increment' ? 'number' : 'string'
    }) {`,
    `  return this.${name}Service.delete(id);`,
    `}`,
    `}`,
    ``,
  ].join('\n');
};

const createServiceText = (name, typeOfId) => {
  return [
    `import { Injectable } from '@nestjs/common'`,
    `import { OneRepoQuery, RepoQuery } from 'src/common/graphql/types'`,
    `import { ${capitalize(name)}Repository } from './${name}.repository'`,
    `import { ${capitalize(name)} } from './entities/${name}.entity';`,
    `import { Create${capitalize(name)}Input, Update${capitalize(
      name,
    )}Input } from './inputs/${name}.input';`,
    ``,
    `@Injectable()`,
    `export class ${capitalize(name)}Service {`,
    `constructor(private readonly ${name}Repository: ${capitalize(
      name,
    )}Repository) {}`,
    ``,
    `getMany(qs: RepoQuery<${capitalize(name)}> = {}, gqlQuery?: string) {`,
    `  return this.${name}Repository.getMany(qs, gqlQuery);`,
    `}`,
    ``,
    `getOne(qs: OneRepoQuery<${capitalize(name)}>, gqlQuery?: string) {`,
    `  return this.${name}Repository.getOne(qs, gqlQuery);`,
    `}`,
    ``,
    `create(input: Create${capitalize(name)}Input) {`,
    `  const ${name} = this.${name}Repository.create(input)`,
    ``,
    `  return this.${name}Repository.save(${name});`,
    `}`,
    ``,
    `update(id:${
      typeOfId === 'increment' ? 'number' : 'string'
    }, input: Update${capitalize(name)}Input) {`,
    `  const ${name} = this.${name}Repository.create(input)`,
    ``,
    `  return this.${name}Repository.update(id, ${name})`,
    `}`,
    ``,
    `delete(id: ${typeOfId === 'increment' ? 'number' : 'string'}) {`,
    `  return this.${name}Repository.delete({ id })`,
    `}`,
    `}`,
    ``,
  ].join('\n');
};

const createRepositoryText = (name) => {
  return [
    `import { CustomRepository } from '../common/decorators/typeorm.decorator'`,
    `import { ${capitalize(name)} } from './entities/${name}.entity'`,
    `import { ExtendedRepository } from 'src/common/graphql/customExtended'`,
    ``,
    `@CustomRepository(${capitalize(name)})`,
    `export class ${capitalize(
      name,
    )}Repository extends ExtendedRepository<${capitalize(name)}> {`,
    `}`,
    ``,
  ].join('\n');
};

const createServiceSpec = (name, typeOfId) => {
  return [
    `import { Test, TestingModule } from '@nestjs/testing'`,
    `import { ${capitalize(name)}Service } from './${name}.service'`,
    ``,
    `import {`,
    `  MockRepository,`,
    `  MockRepositoryFactory,`,
    `} from 'src/common/factory/mockFactory';`,
    `import { getRepositoryToken } from '@nestjs/typeorm'`,
    `import { ${capitalize(name)}Repository } from './${name}.repository'`,
    `import { ${capitalize(name)} } from './entities/${name}.entity'`,
    `import { Create${capitalize(name)}Input, Update${capitalize(
      name,
    )}Input } from './inputs/${name}.input'`,
    `import { ExtendedRepository } from 'src/common/graphql/customExtended'`,
    `import { OneRepoQuery, RepoQuery } from 'src/common/graphql/types'`,
    typeOfId === 'increment'
      ? `import { getRandomNumber } from 'src/util/getRandomNumber'`
      : `import { getRandomUUID } from 'src/util/getRandomUUID'`,
    ``,
    `describe('${capitalize(name)}Service', () => {`,
    `  let service: ${capitalize(name)}Service`,
    `  let mockedRepository: MockRepository<ExtendedRepository<${capitalize(
      name,
    )}>>`,
    ``,
    `  beforeAll(async () => {`,
    `    const module: TestingModule = await Test.createTestingModule({`,
    `      providers: [`,
    `        ${capitalize(name)}Service,`,
    `        {`,
    `          provide: getRepositoryToken(${capitalize(name)}Repository),`,
    `          useFactory: MockRepositoryFactory.getMockRepository(${capitalize(
      name,
    )}Repository),`,
    `        },`,
    `      ],`,
    `    }).compile()`,
    ``,
    `    service = module.get<${capitalize(name)}Service>(${capitalize(
      name,
    )}Service)`,
    `    mockedRepository = module.get<MockRepository<ExtendedRepository<${capitalize(
      name,
    )}>>>(`,
    `      getRepositoryToken(${capitalize(name)}Repository),`,
    `    )`,
    `  })`,
    ``,
    `  afterEach(() => {`,
    `    jest.resetAllMocks()`,
    `  })`,
    ``,
    `  it('Calling "Get many" method', () => {`,
    `    const qs: RepoQuery<${capitalize(name)}> = {`,
    `      where: { id: ${
      typeOfId === 'increment' ? 'getRandomNumber(0,999999)' : 'getRandomUUID()'
    } },`,
    `    }`,
    ``,
    `    expect(service.getMany(qs)).not.toEqual(null)`,
    `    expect(mockedRepository.getMany).toHaveBeenCalled()`,
    `  })`,
    ``,
    `  it('Calling "Get one" method', () => {`,
    `    const qs: OneRepoQuery<${capitalize(name)}> = {`,
    `      where: { id: ${
      typeOfId === 'increment' ? 'getRandomNumber(0,999999)' : 'getRandomUUID()'
    } },`,
    `    }`,
    ``,
    `    expect(service.getOne(qs)).not.toEqual(null)`,
    `    expect(mockedRepository.getOne).toHaveBeenCalled()`,
    `  })`,
    ``,
    `  it('Calling "Create" method', () => {`,
    `    const dto = new Create${capitalize(name)}Input()`,
    `    const ${name} = mockedRepository.create(dto)`,
    ``,
    `    expect(service.create(dto)).not.toEqual(null)`,
    `    expect(mockedRepository.create).toHaveBeenCalledWith(dto)`,
    `    expect(mockedRepository.save).toHaveBeenCalledWith(${name})`,
    `  })`,
    ``,
    `  it('Calling "Update" method', () => {`,
    `    const id = ${
      typeOfId === 'increment' ? 'getRandomNumber(0,999999)' : 'getRandomUUID()'
    }`,
    `    const dto = new Update${capitalize(name)}Input()`,
    `    const ${name} = mockedRepository.create(dto)`,
    ``,
    `    service.update(id, dto)`,
    ``,
    `    expect(mockedRepository.create).toHaveBeenCalledWith(dto)`,
    `    expect(mockedRepository.update).toHaveBeenCalledWith(id, ${name})`,
    `  })`,
    ``,
    `  it('Calling "Delete" method', () => {`,
    `    const id = ${
      typeOfId === 'increment' ? 'getRandomNumber(0,999999)' : 'getRandomUUID()'
    }`,
    ``,
    `    service.delete(id)`,
    ``,
    `    expect(mockedRepository.delete).toHaveBeenCalledWith({ id })`,
    `  })`,
    `})`,

    ,
  ].join('\n');
};

const createResolverSpec = (name, typeOfId) => {
  return [
    `import { Test, TestingModule } from '@nestjs/testing'`,
    `import { ${capitalize(name)}Resolver } from './${name}.resolver'`,
    `import {`,
    `  MockService,`,
    `  MockServiceFactory,`,
    `} from 'src/common/factory/mockFactory'`,
    `import { ${capitalize(name)}Service } from './${name}.service'`,
    `import { GetManyInput, GetOneInput } from 'src/common/graphql/custom.input'`,
    `import { ${capitalize(name)} } from './entities/${name}.entity'`,
    typeOfId === 'increment'
      ? `import { getRandomNumber } from 'src/util/getRandomNumber'`
      : `import { getRandomUUID } from 'src/util/getRandomUUID'`,
    `import { Create${capitalize(name)}Input, Update${capitalize(
      name,
    )}Input } from './inputs/${name}.input'`,
    ``,
    `describe('${capitalize(name)}Resolver', () => {`,
    `  let resolver: ${capitalize(name)}Resolver`,
    `  let mockedService: MockService<${capitalize(name)}Service>`,
    ``,
    `  beforeAll(async () => {`,
    `    const module: TestingModule = await Test.createTestingModule({`,
    `      providers: [`,
    `        ${capitalize(name)}Resolver,`,
    `        {`,
    `          provide: ${capitalize(name)}Service,`,
    `          useFactory: MockServiceFactory.getMockService(${capitalize(
      name,
    )}Service),`,
    `        },`,
    `      ],`,
    `    }).compile()`,
    ``,
    `    resolver = module.get<${capitalize(name)}Resolver>(${capitalize(
      name,
    )}Resolver)`,
    `    mockedService = module.get<MockService<${capitalize(
      name,
    )}Service>>(${capitalize(name)}Service)`,
    `  })`,
    ``,
    `  afterEach(() => {`,
    `    jest.resetAllMocks()`,
    `  })`,
    ``,
    `  it('Calling "Get many ${name} list" method', () => {`,
    `    const qs: GetManyInput<${capitalize(name)}> = {`,
    `      where: { id: ${
      typeOfId === 'increment' ? 'getRandomNumber(0,999999)' : 'getRandomUUID()'
    } },`,
    `    }`,
    ``,
    `    const gqlQuery = ${'`'}`,
    `      query GetMany${capitalize(name)}List {`,
    `        getMany${capitalize(name)}List {`,
    `          data {`,
    `            id`,
    `          }`,
    `        }`,
    `      }`,
    `    ${'`'}`,
    ``,
    `    expect(resolver.getMany${capitalize(
      name,
    )}List(qs, gqlQuery)).not.toEqual(null)`,
    `    expect(mockedService.getMany).toHaveBeenCalledWith(qs, gqlQuery)`,
    `  })`,
    ``,
    `  it('Calling "Get one ${name} list" method', () => {`,
    `    const qs: GetOneInput<${capitalize(name)}> = {`,
    `      where: { id: ${
      typeOfId === 'increment' ? 'getRandomNumber(0,999999)' : 'getRandomUUID()'
    } },`,
    `    }`,
    ``,
    `    const gqlQuery = ${'`'}`,
    `      query GetOne${capitalize(name)} {`,
    `        getOne${capitalize(name)} {`,
    `          data {`,
    `            id`,
    `          }`,
    `        }`,
    `      }`,
    `    ${'`'}`,
    ``,
    `    expect(resolver.getOne${capitalize(
      name,
    )}(qs, gqlQuery)).not.toEqual(null)`,
    `    expect(mockedService.getOne).toHaveBeenCalledWith(qs, gqlQuery)`,
    `  })`,
    ``,
    `  it('Calling "Create ${name}" method', () => {`,
    `    const dto = new Create${capitalize(name)}Input()`,
    ``,
    `    expect(resolver.create${capitalize(name)}(dto)).not.toEqual(null)`,
    `    expect(mockedService.create).toHaveBeenCalledWith(dto)`,
    `  })`,
    ``,
    `  it('Calling "Update ${name}" method', () => {`,
    `    const id = ${
      typeOfId === 'increment' ? 'getRandomNumber(0,999999)' : 'getRandomUUID()'
    }`,
    `    const dto = new Update${capitalize(name)}Input()`,
    ``,
    `    resolver.update${capitalize(name)}(id, dto)`,
    ``,
    `    expect(mockedService.update).toHaveBeenCalledWith(id, dto)`,
    `  })`,
    ``,
    `  it('Calling "Delete ${name}" method', () => {`,
    `    const id = ${
      typeOfId === 'increment' ? 'getRandomNumber(0,999999)' : 'getRandomUUID()'
    }`,
    ``,
    `    resolver.delete${capitalize(name)}(id)`,
    ``,
    `    expect(mockedService.delete).toHaveBeenCalledWith(id)`,
    `  })`,
    `})`,
    ``,
  ].join('\n');
};

const changeAppMpdule = async (name) => {
  const array = [];
  const fileStream = fs.createReadStream('./src/app.module.ts');
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });
  array.push(
    `import { ${capitalize(name)}Module } from './${name}/${name}.module';`,
  );
  for await (const line of rl) {
    array.push(line);
  }

  array.splice(array.length - 6, 0, `    ${capitalize(name)}Module,`);
  const contnet = array.join('\n');
  fs.writeFileSync('./src/app.module.ts', contnet);
};

const addEntity = async (
  dir,
  name,
  createdAt,
  updatedAt,
  typeOfId,
  coulumn,
  type,
  check,
) => {
  await fs.promises.mkdir(`${dir}/entities`, { recursive: true });
  fs.writeFileSync(
    `${dir}/entities/${name}.entity.ts`,
    createEntityFileText(
      name,
      createdAt,
      updatedAt,
      typeOfId,
      coulumn,
      type,
      check,
    ),
  );
  await fs.promises.mkdir(`${dir}/inputs`, { recursive: true });
  fs.writeFileSync(
    `${dir}/inputs/${name}.input.ts`,
    createInputText(name, coulumn, type, check),
  );
};

const addSource = async (name, test, typeOfId) => {
  const dir = `./src/${name}`;
  fs.mkdirSync(dir);
  fs.writeFileSync(`${dir}/${name}.module.ts`, createModuleText(name));
  fs.writeFileSync(
    `${dir}/${name}.service.ts`,
    createServiceText(name, typeOfId),
  );
  fs.writeFileSync(`${dir}/${name}.repository.ts`, createRepositoryText(name));
  fs.writeFileSync(
    `${dir}/${name}.resolver.ts`,
    createResolverModuleText(name, typeOfId),
  );
  if (test !== 'no') {
    fs.writeFileSync(
      `${dir}/${name}.service.spec.ts`,
      createServiceSpec(name, typeOfId),
    );
    fs.writeFileSync(
      `${dir}/${name}.resolver.spec.ts`,
      createResolverSpec(name, typeOfId),
    );
  }
};

const start = async () => {
  let entityDir;
  const { table, test, coulumnList, typeOfId, coulumn, type, check } =
    await inquirer.prompt([
      {
        name: 'table',
        message: 'Please enter the name of the data table to be generated.',
        validate: (input) => {
          const pageDir = `./src/${input}`;
          if (fs.existsSync(pageDir)) {
            return `🚫 [${input}] already exists`;
          }
          entityDir = `./src/${input}`;
          if (fs.existsSync(`${entityDir}/entities`)) {
            return `🚫 [${input}] already exists in entities folder`;
          }
          return String(input).trim().length > 0 || `table is required`;
        },
      },
      {
        type: 'list',
        name: 'test',
        message: 'Do you want to create a jest?',
        choices: ['yes', 'no'],
        default: 'yes',
      },
      {
        name: 'coulumnList',
        type: 'checkbox',
        message: 'Please select a column to exclude.',
        choices: ['createdAt', 'updatedAt'],
      },
      {
        type: 'list',
        name: 'typeOfId',
        message: 'Please select the format of the id.',
        choices: ['increment', 'uuid'],
        default: 'increment',
      },
      {
        name: 'coulumn',
        message: 'Please enter only one data column name to generate.',
        validate: (input) => {
          return String(input).trim().length > 0 || `A column is required`;
        },
      },
      {
        type: 'list',
        name: 'type',
        message: 'Please decide the type of column you created.',
        choices: ['string', 'number', 'boolean'],
        default: 'yes',
      },
      {
        type: 'list',
        name: 'check',
        message:
          'Please decide whether the column you created is required or not.',
        choices: ['required', 'optional'],
        default: 'required',
      },
    ]);

  changeAppMpdule(table);

  addEntity(
    entityDir,
    table,
    !coulumnList.includes('createdAt'),
    !coulumnList.includes('updatedAt'),
    typeOfId,
    coulumn,
    type,
    check,
  );

  addSource(table, test, typeOfId);

  const spinner = ora(
    '🚀  Code formatting...It will take about 10seconds',
  ).start();
  const promisedExec = util.promisify(exec);
  await promisedExec('yarn lint:fix');
  spinner.succeed('🎉  Done!');
};

start();
