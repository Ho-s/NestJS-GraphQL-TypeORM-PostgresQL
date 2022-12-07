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
          `    type: 'timestamp',`,
          `  })`,
          `  createdAt: Date;`,
          ``,
        ]
      : []),
    ...(updatedAt
      ? [
          `  @Field()`,
          `  @UpdateDateColumn({`,
          `    type: 'timestamp',`,
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
    `import { TypeOrmExModule } from '../modules/decorators/typeorm.module'`,
    `import { ${capitalize(name)}Service } from './${name}.service';`,
    `import { ${capitalize(name)}Repository } from './${name}.repository';`,
    `import { ${capitalize(name)}Resolver } from './${name}.resolver';`,
    ``,
    `@Module({`,
    `  imports: [TypeOrmExModule.forCustomRepository([${capitalize(
      name,
    )}Repository])],`,
    `  providers: [${capitalize(name)}Service, ${capitalize(name)}Resolver],`,
    `  exports: [${capitalize(name)}Service]`,
    `})`,
    `export class ${capitalize(name)}Module { }`,
    ``,
  ].join('\n');
};

const createResolverModuleText = (name, typeOfId) => {
  return [
    `import { GraphqlPassportAuthGuard } from '../modules/guards/graphql-passport-auth.guard'`,
    `import { UseGuards } from '@nestjs/common'`,
    `import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'`,
    `import { ${capitalize(name)}Service } from './${name}.service'`,
    `import { GetManyInput, GetOneInput } from 'src/declare/inputs/custom.input';`,
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
    `@UseGuards(new GraphqlPassportAuthGuard('admin'))`,
    `getMany${capitalize(
      name,
    )}s(@Args({ name: 'input', nullable: true }) qs: GetManyInput<${capitalize(
      name,
    )}>) {`,
    `  return this.${name}Service.getMany(qs);`,
    `}`,
    ``,
    `@Query(() => ${capitalize(name)})`,
    `@UseGuards(new GraphqlPassportAuthGuard('admin'))`,
    `getOne${capitalize(
      name,
    )}(@Args({ name: 'input', nullable: true }) qs: GetOneInput<${capitalize(
      name,
    )}>) {`,
    `  return this.${name}Service.getOne(qs);`,
    `}`,
    ``,
    `@Mutation(() => ${capitalize(name)})`,
    `@UseGuards(new GraphqlPassportAuthGuard('admin'))`,
    `create${capitalize(name)}(@Args('input') input: Create${capitalize(
      name,
    )}Input) {`,
    `  return this.${name}Service.create(input);`,
    `}`,
    ``,
    `@Mutation(()=> [${capitalize(name)}])`,
    `@UseGuards(new GraphqlPassportAuthGuard('admin'))`,
    `createMany${capitalize(name)}(`,
    `  @Args({ name: 'input', type: () => [Create${capitalize(name)}Input] })`,
    `  input: Create${capitalize(name)}Input[],`,
    `) {`,
    `  return this.${name}Service.createMany(input);`,
    `}`,
    ``,
    `@Mutation(() => ${capitalize(name)})`,
    `@UseGuards(new GraphqlPassportAuthGuard('admin'))`,
    `update${capitalize(name)}(@Args('id') id: ${
      typeOfId === 'increment' ? 'number' : 'string'
    }, @Args('input') input: Update${capitalize(name)}Input) {`,
    `  return this.${name}Service.update(id, input);`,
    `}`,
    ``,
    `@Mutation(() => ${capitalize(name)})`,
    `@UseGuards(new GraphqlPassportAuthGuard('admin'))`,
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
    `import { OneRepoQuery, RepoQuery } from 'src/declare/types';`,
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
    `getMany(qs?: RepoQuery<${capitalize(name)}>) {`,
    `  return this.${name}Repository.getMany(qs || {});`,
    `}`,
    ``,
    `getOne(qs?: OneRepoQuery<${capitalize(name)}>) {`,
    `  return this.${name}Repository.getOne(qs || {});`,
    `}`,
    ``,
    `create(input: Create${capitalize(name)}Input):Promise<${capitalize(
      name,
    )}> {`,
    `  return this.${name}Repository.save(input);`,
    `}`,
    ``,
    `createMany(input: Create${capitalize(name)}Input[]):Promise<${capitalize(
      name,
    )}[]> {`,
    `  return this.${name}Repository.save(input);`,
    `}`,
    ``,
    `async update(id:${
      typeOfId === 'increment' ? 'number' : 'string'
    }, input: Update${capitalize(name)}Input):Promise<${capitalize(name)}> {`,
    `  const ${name} = await this.${name}Repository.findOne({ where: { id } })`,
    `  return this.${name}Repository.save({ ...${name}, ...input })`,
    `}`,
    ``,
    `async delete(id: ${typeOfId === 'increment' ? 'number' : 'string'}) {`,
    `  const ${name} = this.${name}Repository.findOne({ where: { id } })`,
    `  await this.${name}Repository.delete({ id })`,
    `  return ${name}`,
    `}`,
    `}`,
    ``,
  ].join('\n');
};

const createRepositoryText = (name) => {
  return [
    `import { ${capitalize(name)} } from './entities/${name}.entity'`,
    `import { CustomRepository } from '../modules/decorators/typeorm.decorator'`,
    `import { Repository } from 'typeorm/repository/Repository'`,
    ``,
    `@CustomRepository(${capitalize(name)})`,
    `export class ${capitalize(name)}Repository extends Repository<${capitalize(
      name,
    )}> {`,
    `}`,
    ``,
  ].join('\n');
};

const createTestText = (name, type) => {
  return [
    `import { Test, TestingModule } from '@nestjs/testing'`,
    `import { ${capitalize(name)}${capitalize(
      type,
    )} } from './${name}.${type}'`,
    ``,
    `describe('${capitalize(name)}${capitalize(type)}', () => {`,
    `  let ${type}: ${capitalize(name)}${capitalize(type)}`,
    ``,
    `  beforeEach(async () => {`,
    `    const module: TestingModule = await Test.createTestingModule({`,
    `      providers: [${capitalize(name)}${capitalize(type)}]`,
    `    }).compile()`,
    ``,
    `    ${type} = module.get<${capitalize(name)}${capitalize(
      type,
    )}>(${capitalize(name)}${capitalize(type)})`,
    `  })`,
    ``,
    `  it('should be defined', () => {`,
    `    expect(${type}).toBeDefined()`,
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
  for await (let line of rl) {
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
      createTestText(name, 'service'),
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
