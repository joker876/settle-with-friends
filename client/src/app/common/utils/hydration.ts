// Utility functions to hydrate objects with related data based on mapping tokens.
// All of the below functions mutate the original objects.
// @experimental

import { Signal } from "@angular/core";

export interface MappingToken<T extends Record<string, any>> {
  isSingle: boolean;
  destProp: keyof T;
  idProp: keyof T;
  arrayProp?: keyof T;
}

function _getMap<V>(
  valueMap: Record<number, V> | Signal<Record<number, V>>,
) {
  return valueMap instanceof Function ? valueMap() : valueMap;
}

function _mapUsersMutate<T extends Record<string, any>>(
  objects: T[],
  destProp: keyof T,
  idProp: keyof T,
  valueMap: Record<number, any>,
): void {
  objects.forEach(v => {
    v[destProp] = _getObject(v[idProp] as number, valueMap) as any;
    if (!v[destProp]) {
      console.warn(`Failed to hydrate property ${String(destProp)} for object`, v);
    }
  });
}

function _getObject<V>(userId: number, valueMap: Record<number, V>): V {
  return valueMap[userId];
}

export function hydrateSingleProp<T extends Record<string, any>, V>(
  mappingTokens: MappingToken<T>[],
  valueMap: Record<number, V> | Signal<Record<number, V>>,
): (objects: T[]) => T[] {
  return objects =>
    objects.map(v => {
      for (const token of mappingTokens) {
        if (token.isSingle) {
          v[token.destProp] = _getObject(v[token.idProp], _getMap(valueMap)) as any;
          if (!v[token.destProp]) {
            console.warn(`Failed to hydrate property ${String(token.destProp)} for object`, v);
          }
          continue;
        }
        _mapUsersMutate<T>(v[token.arrayProp!], token.destProp, token.idProp, _getMap(valueMap));
      }
      return v;
    });
}

export function hydrateAllInArray<T extends Record<string, any>, A extends Record<string, any>, V>(
  arrayProp: keyof T,
  mappingTokens: MappingToken<A>[],
  valueMap: Record<number, V> | Signal<Record<number, V>>,
): (objects: T[]) => T[] {
  return objects =>
    objects.map(obj => {
      if (Array.isArray(obj[arrayProp])) {
        obj[arrayProp] = hydrateSingleProp<A, V>(mappingTokens, valueMap)(obj[arrayProp]) as any;
      }
      return obj;
    });
}
