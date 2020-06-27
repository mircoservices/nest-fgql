import { Injectable } from '@nestjs/common';
import { isString } from '@nestjs/common/utils/shared.utils';
import { GraphQLSchema, printSchema, specifiedDirectives } from 'graphql';
import { resolve } from 'path';
import { SDL_FILE_HEADER } from '../fgql.constants';
import { BuildSchemaOptions } from '../interfaces/build-schema-options.interface';
import { FgqlModuleOptions } from '../interfaces/fgql-module-options.interface';
import { GraphQLSchemaFactory } from '../schema-builder/graphql-schema.factory';
import { FileSystemHelper } from '../schema-builder/helpers/file-system.helper';
import { ScalarsExplorerService } from '../services';

@Injectable()
export class GraphQLSchemaBuilder {
  constructor(
    private readonly scalarsExplorerService: ScalarsExplorerService,
    private readonly gqlSchemaFactory: GraphQLSchemaFactory,
    private readonly fileSystemHelper: FileSystemHelper,
  ) {}

  async build(
    autoSchemaFile: string | boolean,
    options: FgqlModuleOptions,
    resolvers: Function[],
  ): Promise<any> {
    const scalarsMap = this.scalarsExplorerService.getScalarsMap();
    try {
      const buildSchemaOptions = options.buildSchemaOptions || {};
      return await this.buildSchema(resolvers, autoSchemaFile, {
        ...buildSchemaOptions,
        scalarsMap,
        schemaDirectives: options.schemaDirectives,
      });
    } catch (err) {
      if (err && err.details) {
        console.error(err.details);
      }
      throw err;
    }
  }

  async buildFederatedSchema(
    autoSchemaFile: string | boolean,
    options: FgqlModuleOptions,
    resolvers: Function[],
  ) {
    const scalarsMap = this.scalarsExplorerService.getScalarsMap();
    try {
      const buildSchemaOptions = options.buildSchemaOptions || {};
      return await this.buildSchema(resolvers, autoSchemaFile, {
        ...buildSchemaOptions,
        directives: [
          ...specifiedDirectives,
          ...((buildSchemaOptions && buildSchemaOptions.directives) || []),
        ],
        scalarsMap,
        schemaDirectives: options.schemaDirectives,
        skipCheck: true,
      });
    } catch (err) {
      if (err && err.details) {
        console.error(err.details);
      }
      throw err;
    }
  }

  private async buildSchema(
    resolvers: Function[],
    autoSchemaFile: boolean | string,
    options: BuildSchemaOptions = {},
  ): Promise<GraphQLSchema> {
    const schema = await this.gqlSchemaFactory.create(resolvers, options);
    if (typeof autoSchemaFile !== 'boolean') {
      const filename = isString(autoSchemaFile)
        ? autoSchemaFile
        : resolve(process.cwd(), 'schema.gql');

      const fileContent = SDL_FILE_HEADER + printSchema(schema);
      await this.fileSystemHelper.writeFile(filename, fileContent);
    }
    return schema;
  }
}
