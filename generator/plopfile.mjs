import { exec } from 'child_process';
import fs from 'fs';
import ora from 'ora';
import util from 'util';

const prettify = async () => {
  const spinner = ora(
    '🚀  Code formatting...It will take about 10seconds',
  ).start();
  const promisedExec = util.promisify(exec);
  await promisedExec('yarn lint:fix');
  spinner.succeed('🎉  Done!');
};

const __dirname = new URL('../', import.meta.url).pathname;
const rootPath = __dirname + 'src';

const TABLE_NAME = 'tableName';
const TEST_NEEDED = 'testNeeded';
const CLOUMN_LIST = 'columnList';
const ID_TYPE = 'idType';
const COLUMN_NAME = 'columnName';
const COLUMN_TYPE = 'columnType';
const COLUMN_REQUIRED = 'columnRequired';

export default function generator(plop) {
  plop.addHelper('is', (v1, v2) => v1 === v2);
  plop.addHelper('isIn', (v1, v2) => v2.includes(v1));
  plop.setGenerator('Table-generator', {
    description: 'Adds a new table',
    prompts: [
      {
        type: 'input',
        name: TABLE_NAME,
        message: 'Table Name',
        validate: (input) => {
          const pageDir = rootPath + `/${input}`;
          if (fs.existsSync(pageDir)) {
            return `🚫 [${input}] already exists`;
          }

          return String(input).trim().length > 0 || `Table name is required`;
        },
      },
      {
        type: 'confirm',
        name: TEST_NEEDED,
        message: 'Do you want to create a jest?',
        default: true,
      },
      {
        type: 'checkbox',
        name: CLOUMN_LIST,
        message: 'Please select a column to incluede.',
        choices: ['createdAt', 'updatedAt'],
        default: ['createdAt', 'updatedAt'],
      },
      {
        type: 'list',
        name: ID_TYPE,
        message: 'Please select the format of the id.',
        choices: ['increment', 'uuid'],
        default: 'increment',
      },
      {
        type: 'input',
        name: COLUMN_NAME,
        message: 'Please enter only one data column name to generate.',
        validate: (input) => {
          return String(input).trim().length > 0 || `A column is required`;
        },
      },
      {
        type: 'list',
        name: COLUMN_TYPE,
        message: 'Please decide the type of column you created.',
        choices: ['string', 'number', 'boolean'],
        default: 'string',
      },
      {
        type: 'confirm',
        name: COLUMN_REQUIRED,
        message: 'The column you created is required?',
        default: true,
      },
    ],
    actions: (data) => [
      {
        type: 'add',
        path: `${rootPath}/{{${TABLE_NAME}}}/entities/{{${TABLE_NAME}}}.entity.ts`,
        templateFile: 'templates/entity.hbs',
      },
      {
        type: 'add',
        path: `${rootPath}/{{${TABLE_NAME}}}/inputs/{{${TABLE_NAME}}}.input.ts`,
        templateFile: 'templates/input.hbs',
      },
      {
        type: 'add',
        path: `${rootPath}/{{${TABLE_NAME}}}/{{${TABLE_NAME}}}.module.ts`,
        templateFile: 'templates/module.hbs',
      },
      {
        type: 'add',
        path: `${rootPath}/{{${TABLE_NAME}}}/{{${TABLE_NAME}}}.resolver.ts`,
        templateFile: 'templates/resolver.hbs',
      },
      {
        type: 'add',
        path: `${rootPath}/{{${TABLE_NAME}}}/{{${TABLE_NAME}}}.service.ts`,
        templateFile: 'templates/service.hbs',
      },
      {
        type: 'add',
        path: `${rootPath}/{{${TABLE_NAME}}}/{{${TABLE_NAME}}}.repository.ts`,
        templateFile: 'templates/repository.hbs',
      },
      {
        type: 'add',
        path: `${rootPath}/{{${TABLE_NAME}}}/{{${TABLE_NAME}}}.module.integration.spec.ts`,
        templateFile: 'templates/module.integration.spec.hbs',
        ...(!data[TEST_NEEDED] && {
          skip: () => 'skipped',
        }),
      },
      {
        type: 'add',
        path: `${rootPath}/{{${TABLE_NAME}}}/{{${TABLE_NAME}}}.resolver.spec.ts`,
        templateFile: 'templates/resolver.spec.hbs',
        ...(!data[TEST_NEEDED] && {
          skip: () => 'skipped',
        }),
      },
      {
        type: 'add',
        path: `${rootPath}/{{${TABLE_NAME}}}/{{${TABLE_NAME}}}.service.spec.ts`,
        templateFile: 'templates/service.spec.hbs',
        ...(!data[TEST_NEEDED] && {
          skip: () => 'skipped',
        }),
      },
      {
        type: 'append',
        path: `${rootPath}/app.module.ts`,
        separator: '\n',
        pattern: "'@nestjs/apollo';",
        template:
          "import { {{ pascalCase tableName }}Module } from './{{ tableName }}/{{ tableName }}.module';",
      },
      {
        type: 'append',
        path: `${rootPath}/app.module.ts`,
        separator: '\n',
        pattern: '@Module({\n  imports: [',
        template: '{{ pascalCase tableName }}Module,',
      },

      () => prettify(),
    ],
  });
}
