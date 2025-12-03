// Utility functions to hydrate objects with related data based on mapping tokens.
// All of the below functions mutate the original objects.
// @experimental

export interface MappingToken<T extends Record<string, any>> {
  isSingle: boolean;
  destProp: keyof T;
  idProp: keyof T;
  arrayProp?: keyof T;
}

function _mapUsersMutate<T extends Record<string, any>>(
  objects: T[],
  destProp: keyof T,
  idProp: keyof T,
  valueMap: Record<number, any>,
): void {
  objects.forEach(v => (v[destProp] = valueMap[v[idProp]] as any));
}

function _getUser<V>(userId: number, valueMap: Record<number, V>): V {
  return valueMap[userId];
}

export function hydrateSingleProp<T extends Record<string, any>, V>(
  mappingTokens: MappingToken<T>[],
  valueMap: Record<number, V>,
): (objects: T[]) => T[] {
  return objects =>
    objects.map(v => {
      for (const token of mappingTokens) {
        if (token.isSingle) {
          v[token.destProp] = _getUser(v[token.idProp], valueMap) as any;
          continue;
        }
        _mapUsersMutate<T>(v[token.arrayProp!], token.destProp, token.idProp, valueMap);
      }
      return v;
    });
}

export function hydrateAllInArray<T extends Record<string, any>, A extends Record<string, any>, V>(
  arrayProp: keyof T,
  mappingTokens: MappingToken<A>[],
  valueMap: Record<number, V>,
): (objects: T[]) => T[] {
  return objects =>
    objects.map(obj => {
      if (Array.isArray(obj[arrayProp])) {
        obj[arrayProp] = hydrateSingleProp<A, V>(mappingTokens, valueMap)(obj[arrayProp]) as any;
      }
      return obj;
    });
}
