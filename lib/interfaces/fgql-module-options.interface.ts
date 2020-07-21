import { ModuleMetadata, Type } from '@nestjs/common/interfaces';
import * as GQL from 'fastify-gql';
import { GraphQLSchema } from 'graphql';
import { IResolvers } from 'graphql-tools';
import { DefinitionsGeneratorOptions } from '../graphql/graphql-ast.explorer';
import { BuildSchemaOptions } from './build-schema-options.interface';

export interface FgqlModuleOptions
  extends Omit<GQL.Options, 'schema' | 'resolvers'> {
  schema?: GraphQLSchema;
  resolvers?: IResolvers;
  typeDefs?: string | string[];
  typePaths?: string[];
  transformSchema?: (
    schema: GraphQLSchema,
  ) => GraphQLSchema | Promise<GraphQLSchema>;
  definitions?: {
    path?: string;
    outputAs?: 'class' | 'interface';
  } & DefinitionsGeneratorOptions;
  autoSchemaFile?: string | boolean;
  buildSchemaOptions?: BuildSchemaOptions;
  include?: Function[];
  schemaDirectives?: Record<string, any>;
  resolverValidationOptions?: IResolverValidationOptions;
  directiveResolvers?: any;
  /**
   * Enable/disable enhancers for @ResolveField()
   */
  fieldResolverEnhancers?: Enhancer[];
}

export type Enhancer = 'guards' | 'interceptors' | 'filters';

export interface IResolverValidationOptions {
  requireResolversForArgs?: boolean;
  requireResolversForNonScalar?: boolean;
  requireResolversForAllFields?: boolean;
  requireResolversForResolveType?: boolean;
  allowResolversNotInSchema?: boolean;
}

export interface GqlOptionsFactory {
  createGqlOptions(): Promise<FgqlModuleOptions> | FgqlModuleOptions;
}

export interface GqlModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<GqlOptionsFactory>;
  useClass?: Type<GqlOptionsFactory>;
  useFactory?: (
    ...args: any[]
  ) => Promise<FgqlModuleOptions> | FgqlModuleOptions;
  inject?: any[];
}
