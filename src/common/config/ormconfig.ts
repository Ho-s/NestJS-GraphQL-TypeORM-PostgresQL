import { registerAs } from '@nestjs/config';

import { config } from 'dotenv';
import { join } from 'path';
import { cwd, env } from 'process';
import { DataSource, DataSourceOptions } from 'typeorm';

import { getEnvPath } from '../helper/env.helper';

config({
  path: getEnvPath(cwd()),
});

const typeormConfig: DataSourceOptions = {
  type: 'postgres',
  host: env.DB_HOST,
  port: Number(env.DB_PORT),
  username: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  entities:
    env.NODE_ENV === 'test'
      ? [join(cwd(), 'src', '**', '*.entity.{ts,js}')]
      : [join(cwd(), 'dist', '**', '*.entity.js')],
  synchronize: env.NODE_ENV !== 'production',
  dropSchema: env.NODE_ENV === 'test',
  migrations: [
    join(cwd(), 'dist', 'common', 'database', 'migrations', '*{.ts,.js}'),
  ],
  migrationsRun: false,
  logging: false, // if you want to see the query log, change it to true
};

export const typeormConfigKey = 'typeorm';
export const typeormConfigLoader = registerAs(
  typeormConfigKey,
  () => typeormConfig,
);
export default new DataSource(typeormConfig);
