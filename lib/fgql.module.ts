import {
  DynamicModule,
  Inject,
  Module,
  OnModuleInit,
  Provider,
} from '@nestjs/common';
import { HttpAdapterHost, MetadataScanner } from '@nestjs/core';
import * as GQL from 'fastify-gql';
import { printSchema } from 'graphql';
import { GRAPHQL_MODULE_ID, GRAPHQL_MODULE_OPTIONS } from './fgql.constants';
import {
  GraphQLAstExplorer,
  GraphQLFactory,
  GraphQLSchemaBuilder,
  GraphQLSchemaHost,
  GraphQLTypesLoader,
} from './graphql';
import {
  FgqlModuleOptions,
  GqlModuleAsyncOptions,
  GqlOptionsFactory,
} from './interfaces/fgql-module-options.interface';
import { GraphQLSchemaBuilderModule } from './schema-builder';
import { ResolversExplorerService, ScalarsExplorerService } from './services';
import { extend, generateString, mergeDefaults } from './utils';

@Module({
  imports: [GraphQLSchemaBuilderModule],
  providers: [
    GraphQLFactory,
    MetadataScanner,
    ResolversExplorerService,
    ScalarsExplorerService,
    GraphQLAstExplorer,
    GraphQLTypesLoader,
    GraphQLSchemaBuilder,
    GraphQLSchemaHost,
  ],
  exports: [GraphQLTypesLoader, GraphQLAstExplorer, GraphQLSchemaHost],
})
export class FgqlModule implements OnModuleInit {
  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    private readonly graphqlFactory: GraphQLFactory,
    private readonly graphqlTypesLoader: GraphQLTypesLoader,
    @Inject(GRAPHQL_MODULE_OPTIONS)
    private readonly options: FgqlModuleOptions,
  ) {}

  static forRoot(options: FgqlModuleOptions = {}): DynamicModule {
    options = mergeDefaults(options);
    return {
      module: FgqlModule,
      providers: [
        {
          provide: GRAPHQL_MODULE_OPTIONS,
          useValue: options,
        },
      ],
    };
  }

  static forRootAsync(options: GqlModuleAsyncOptions): DynamicModule {
    return {
      module: FgqlModule,
      imports: options.imports,
      providers: [
        ...this.createAsyncProviders(options),
        {
          provide: GRAPHQL_MODULE_ID,
          useValue: generateString(),
        },
      ],
    };
  }

  private static createAsyncProviders(
    options: GqlModuleAsyncOptions,
  ): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }
    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: options.useClass,
        useClass: options.useClass,
      },
    ];
  }

  private static createAsyncOptionsProvider(
    options: GqlModuleAsyncOptions,
  ): Provider {
    if (options.useFactory) {
      return {
        provide: GRAPHQL_MODULE_OPTIONS,
        useFactory: async (...args: any[]) =>
          mergeDefaults(await options.useFactory(...args)),
        inject: options.inject || [],
      };
    }
    return {
      provide: GRAPHQL_MODULE_OPTIONS,
      useFactory: async (optionsFactory: GqlOptionsFactory) =>
        mergeDefaults(await optionsFactory.createGqlOptions()),
      inject: [options.useExisting || options.useClass],
    };
  }

  async onModuleInit() {
    if (!this.httpAdapterHost) {
      return;
    }
    const httpAdapter = this.httpAdapterHost.httpAdapter;
    if (!httpAdapter) {
      return;
    }
    const typeDefs =
      (await this.graphqlTypesLoader.mergeTypesByPaths(
        this.options.typePaths,
      )) || [];

    const mergedTypeDefs = extend(typeDefs, this.options.typeDefs);
    const options = await this.graphqlFactory.mergeOptions({
      ...this.options,
      typeDefs: mergedTypeDefs,
    });

    if (this.options.definitions && this.options.definitions.path) {
      await this.graphqlFactory.generateDefinitions(
        printSchema(options.schema),
        this.options,
      );
    }

    this.registerGqlServer(options);
  }

  private registerGqlServer(options: FgqlModuleOptions) {
    const httpAdapter = this.httpAdapterHost.httpAdapter;
    const platformName = httpAdapter.getType();

    if (platformName !== 'fastify') {
      throw new Error(`No support for current HttpAdapter: ${platformName}`);
    }

    const app = httpAdapter.getInstance();

    app.register(GQL, {
      graphiql: true,
      jit: 1,
      ...options,
    });

    app.addHook('preHandler', async (request, reply) => {
      // make sure that operationName is null, if empty string is passed
      if (request?.body?.operationName === '') {
        request.body.operationName = null;
      }
      return;
    });
  }
}
