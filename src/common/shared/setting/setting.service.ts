import { ApolloDriverConfig } from '@nestjs/apollo';
import { Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import GraphQLJSON from 'graphql-type-json';
import { join } from 'path';

import { formatError } from 'src/common/format/graphql-error.format';

import { UtilService } from '../services/util.service';

@Injectable()
export class SettingService {
  constructor(private readonly utilService: UtilService) {}

  get graphqlUseFactory():
    | Omit<ApolloDriverConfig, 'driver'>
    | (Promise<Omit<ApolloDriverConfig, 'driver'>> & { uploads: boolean }) {
    return {
      uploads: false,
      resolvers: { JSON: GraphQLJSON },
      autoSchemaFile: join(
        process.cwd(),
        `${this.utilService.nodeEnv === 'test' ? 'test' : 'src'}/graphql-schema.gql`,
      ),
      sortSchema: true,
      playground: false,
      ...(!this.utilService.isProduction && {
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
      host: this.utilService.getString('DB_HOST'),
      port: this.utilService.getNumber('DB_PORT'),
      username: this.utilService.getString('DB_USER'),
      password: this.utilService.getString('DB_PASSWORD'),
      database: this.utilService.getString('DB_NAME'),
      entities:
        this.utilService.nodeEnv === 'test'
          ? [join(process.cwd(), 'src', '**', '*.entity.{ts,js}')]
          : ['dist/**/*.entity.js'],
      synchronize: this.utilService.nodeEnv !== 'production',
      autoLoadEntities: true,
      dropSchema: this.utilService.nodeEnv === 'test',
      logging: false, // if you want to see the query log, change it to true
    };
  }
}
