
export interface MappingToken<T extends Record<string ,any>> {
  isSingle: boolean;
  destProp: keyof T;
  idProp: keyof T;
  arrayProp?: keyof T;
}