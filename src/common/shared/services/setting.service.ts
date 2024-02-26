import { ApolloDriverConfig } from '@nestjs/apollo';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import GraphQLJSON from 'graphql-type-json';
import { isNil } from 'lodash';
import { join } from 'path';
import { formatError } from 'src/common/format/graphql-error.format';

@Injectable()
export class SettingService {
  constructor(private readonly configService: ConfigService) {}

  private get(key: string): string {
    const value = this.configService.get<string>(key);

    if (isNil(value)) {
      throw new Error(key + ' environment variable does not set');
    }

    return value;
  }

  private getNumber(key: string): number {
    const value = this.get(key);

    try {
      return Number(value);
    } catch {
      throw new Error(key + ' environment variable is not a number');
    }
  }

  private getString(key: string): string {
    const value = this.get(key);

    return value.replace(/\\n/g, '\n');
  }

  get nodeEnv() {
    return this.getString('NODE_ENV') as 'development' | 'production' | 'test';
  }

  get isDevelopment(): boolean {
    return this.nodeEnv === 'development';
  }

  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  get graphqlUseFactory():
    | Omit<ApolloDriverConfig, 'driver'>
    | (Promise<Omit<ApolloDriverConfig, 'driver'>> & { uploads: boolean }) {
    return {
      uploads: false,
      resolvers: { JSON: GraphQLJSON },
      autoSchemaFile: join(
        process.cwd(),
        `${this.nodeEnv === 'test' ? 'test' : 'src'}/graphql-schema.gql`,
      ),
      sortSchema: true,
      playground: false,
      ...(!this.isProduction && {
        plugins: [ApolloServerPluginLandingPageLocalDefault()],
      }),
      context: ({ req }) => ({ req }),
      cache: 'bounded',
      formatError,
    };
  }

  get typeOrmUseFactory():
    | TypeOrmModuleOptions
    | Promise<TypeOrmModuleOptions> {
    return {
      type: 'postgres',
      host: this.getString('DB_HOST'),
      port: this.getNumber('DB_PORT'),
      username: this.getString('DB_USER'),
      password: this.getString('DB_PASSWORD'),
      database: this.getString('DB_NAME'),
      entities:
        this.nodeEnv === 'test'
          ? [join(process.cwd(), 'src', '**', '*.entity.{ts,js}')]
          : ['dist/**/*.entity.js'],
      synchronize: this.nodeEnv !== 'production',
      autoLoadEntities: true,
      dropSchema: this.nodeEnv === 'test',
      logging: false, // if you want to see the query log, change it to true
    };
  }
}
