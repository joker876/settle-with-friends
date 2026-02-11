import { Resource, Signal, computed } from '@angular/core';
import { SelectableOption } from '@common/utils/options';

export function mapResourceToSelectableIdOptions<T extends { id: number | string }, V = T['id']>(
  resource: Resource<T[] | null>,
  getLabel: (item: T) => string,
  getValue: (item: T) => V = item => item.id as unknown as V,
): Signal<SelectableOption<V>[]> {
  return computed<SelectableOption<V>[]>(() => {
    const values = resource.value() ?? [];
    return values.map(item => ({
      label: getLabel(item) ?? '',
      value: getValue(item),
    }));
  });
}

export function mapResourceToIdMap<T extends { id: number | string }>(
  resource: Resource<T[] | null>,
  getKey: (item: T) => number | string = item => item.id,
): Signal<Map<number | string, T>> {
  return computed<Map<number | string, T>>(() => {
    const values = resource.value() ?? [];
    const map = new Map<number | string, T>();
    values.forEach(item => {
      map.set(getKey(item), item);
    });
    return map;
  });
}
