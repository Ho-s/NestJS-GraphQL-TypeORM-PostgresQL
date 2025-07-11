import { ApolloDriverConfig } from '@nestjs/apollo';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GqlOptionsFactory } from '@nestjs/graphql';

import {
  ApolloServerPluginLandingPageLocalDefault,
  ApolloServerPluginLandingPageProductionDefault,
} from '@apollo/server/plugin/landingPage/default';
import GraphQLJSON from 'graphql-type-json';
import { join } from 'path';
import { cwd } from 'process';

import { httpStatusPlugin } from '../exceptions/exception.plugin';
import { EnvironmentVariables } from '../helper/env.validation';

@Injectable()
export class GraphqlConfigService
  implements GqlOptionsFactory<ApolloDriverConfig>
{
  constructor(
    private readonly configService: ConfigService<EnvironmentVariables>,
  ) {}

  createGqlOptions(): Promise<ApolloDriverConfig> | ApolloDriverConfig {
    return {
      resolvers: { JSON: GraphQLJSON },
      autoSchemaFile: join(
        cwd(),
        `${this.configService.get('NODE_ENV') === 'test' ? 'test' : 'src'}/graphql-schema.gql`,
      ),
      sortSchema: true,
      playground: false,
      plugins: [
        httpStatusPlugin,
        this.configService.get('NODE_ENV') === 'production'
          ? ApolloServerPluginLandingPageProductionDefault()
          : ApolloServerPluginLandingPageLocalDefault(),
      ],

      context: ({ req }) => ({ req }),
      cache: 'bounded',
      csrfPrevention: this.configService.get('NODE_ENV') !== 'development',
    };
  }
}
