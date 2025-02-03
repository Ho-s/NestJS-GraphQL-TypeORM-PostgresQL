import { ApolloDriverConfig } from '@nestjs/apollo';
import { Injectable } from '@nestjs/common';

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
}
