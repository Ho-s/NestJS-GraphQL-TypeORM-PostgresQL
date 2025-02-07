import { ConfigService } from '@nestjs/config';

import { config } from 'dotenv';
import { join } from 'path';
import { cwd, env } from 'process';
import { DataSource, DataSourceOptions } from 'typeorm';

import { getEnvPath } from '../helper/env.helper';

config({
  path: getEnvPath(cwd()),
});

export const setTypeormConfig = (
  conf: NodeJS.ProcessEnv | ConfigService,
): DataSourceOptions => {
  const getConfigValue =
    conf instanceof ConfigService
      ? conf.get.bind(conf)
      : (key: string) => conf[key];

  return {
    type: 'postgres',
    host: getConfigValue('DB_HOST'),
    port: Number(getConfigValue('DB_PORT')),
    username: getConfigValue('DB_USER'),
    password: getConfigValue('DB_PASSWORD'),
    database: getConfigValue('DB_NAME'),
    entities:
      getConfigValue('NODE_ENV') === 'test'
        ? [join(cwd(), 'src', '**', '*.entity.{ts,js}')]
        : [join(cwd(), 'dist', '**', '*.entity.js')],
    synchronize: getConfigValue('NODE_ENV') !== 'production',
    dropSchema: getConfigValue('NODE_ENV') === 'test',
    migrations: [
      join(cwd(), 'dist', 'common', 'database', 'migrations', '*{.ts,.js}'),
    ],
    migrationsRun: false,
    logging: false,
  };
};

export default new DataSource(setTypeormConfig(env));
