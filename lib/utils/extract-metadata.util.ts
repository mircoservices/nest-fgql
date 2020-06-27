import 'reflect-metadata';
import {
  RESOLVER_NAME_METADATA,
  RESOLVER_PROPERTY_METADATA,
  RESOLVER_TYPE_METADATA,
} from '../fgql.constants';
import { ResolverMetadata } from '../interfaces/resolver-metadata.interface';

export function extractMetadata(
  instance: Record<string, any>,
  prototype: any,
  methodName: string,
  filterPredicate: (
    resolverType: string,
    isReferenceResolver?: boolean,
    isPropertyResolver?: boolean,
  ) => boolean,
): ResolverMetadata {
  const callback = prototype[methodName];
  const resolverType =
    Reflect.getMetadata(RESOLVER_TYPE_METADATA, callback) ||
    Reflect.getMetadata(RESOLVER_TYPE_METADATA, instance.constructor);

  const isPropertyResolver = !!Reflect.getMetadata(
    RESOLVER_PROPERTY_METADATA,
    callback,
  );

  const resolverName = Reflect.getMetadata(RESOLVER_NAME_METADATA, callback);
  if (filterPredicate(resolverType, false, isPropertyResolver)) {
    return null;
  }

  const name = resolverName || methodName;
  return {
    type: resolverType,
    methodName,
    name,
  };
}
