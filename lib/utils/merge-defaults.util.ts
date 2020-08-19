import { FastifyReply, FastifyRequest } from 'fastify';
import { isFunction } from '@nestjs/common/utils/shared.utils';
import { FgqlModuleOptions } from '../interfaces/fgql-module-options.interface';

const defaultOptions: FgqlModuleOptions = {
  path: '/graphql',
  fieldResolverEnhancers: [],
};

export function mergeDefaults(
  options: FgqlModuleOptions,
  defaults: FgqlModuleOptions = defaultOptions,
): FgqlModuleOptions {
  const moduleOptions = {
    ...defaults,
    ...options,
  };
  if (!moduleOptions.context) {
    moduleOptions.context = (
      request: FastifyRequest,
      reply: FastifyReply<unknown>,
    ) => Promise.resolve({ req: request });
  } else if (isFunction(moduleOptions.context)) {
    moduleOptions.context = async (
      request: FastifyRequest,
      reply: FastifyReply<unknown>,
    ) => {
      const ctx = await (options.context as Function)(request, reply);
      return assignReqProperty(ctx, request);
    };
  } else {
    moduleOptions.context = (
      request: FastifyRequest,
      reply: FastifyReply<unknown>,
    ) => {
      return Promise.resolve(
        assignReqProperty(options.context as Record<string, any>, request),
      );
    };
  }
  return moduleOptions;
}

function assignReqProperty(
  ctx: Record<string, unknown> | undefined,
  req: unknown,
) {
  if (!ctx) {
    return { req };
  }
  if (
    typeof ctx !== 'object' ||
    (ctx && ctx.req && typeof ctx.req === 'object')
  ) {
    return ctx;
  }
  ctx.req = req;
  return ctx;
}
