import { HttpEventType } from '@angular/common/http';
import { ResourceStatus, WritableSignal } from '@angular/core';
import { WritableMapSignal, WritableSetSignal } from '@ardium-ui/devkit';
import { buffer, filter, map, Observable, OperatorFunction, tap } from 'rxjs';

function isMapSignal<Key, T>(
  v: WritableSignal<T> | WritableMapSignal<Key, T> | WritableSetSignal<Key>,
): v is WritableMapSignal<Key, T> {
  return 'setKey' in v;
}
function isSetSignal<Key, T>(
  v: WritableSignal<T> | WritableMapSignal<Key, T> | WritableSetSignal<Key>,
): v is WritableSetSignal<Key> {
  return 'add' in v;
}

/**
 * Buffers source values until `gate$` emits `true`.
 * On each `true`, emits only the *last* buffered value (if any).
 */
export function bufferLastUntil<T>(gate$: Observable<boolean>): OperatorFunction<T, T> {
  const gateTrue$ = gate$.pipe(
    filter(Boolean),
  );

  return (source: Observable<T>) =>
    source.pipe(
      buffer(gateTrue$),
      map(buf => buf[buf.length - 1]),
      filter((v): v is T => v !== undefined),
    );
}

export function setLoadingFalse<T>(loadingSignal: WritableSignal<boolean>): OperatorFunction<T, T>;
export function setLoadingFalse<Key, T>(
  loadingIdBasedSetSignal: WritableSetSignal<Key>,
  itemId: Key,
): OperatorFunction<T, T>;
export function setLoadingFalse<Key, T>(
  loadingIdBasedMapSignal: WritableMapSignal<Key, boolean>,
  itemId: Key,
): OperatorFunction<T, T>;
export function setLoadingFalse<Key, T>(
  loadingSignal: WritableSignal<boolean> | WritableMapSignal<Key, boolean> | WritableSetSignal<Key>,
  itemId?: Key,
): OperatorFunction<T, T> {
  function setFn(): void {
    if (isMapSignal(loadingSignal)) {
      loadingSignal.delete(itemId!);
    } else if (isSetSignal(loadingSignal)) {
      loadingSignal.delete(itemId!);
    } else {
      loadingSignal.set(false);
    }
  }
  return tap({
    next: eventOrValue => {
      if (
        eventOrValue &&
        typeof eventOrValue === 'object' &&
        'type' in eventOrValue &&
        eventOrValue.type !== HttpEventType.Response
      ) {
        return;
      }
      setFn();
    },
    error: () => setFn(),
  });
}

export function setResourceStatusAfterLoaded<Key, T>(
  resourceStatusSignal: WritableSignal<ResourceStatus> | WritableMapSignal<Key, ResourceStatus>,
  itemId?: Key,
): OperatorFunction<T, T> {
  function setFn(): void {
    if (isMapSignal(resourceStatusSignal)) {
      resourceStatusSignal.setKey(itemId!, 'resolved');
    } else {
      resourceStatusSignal.set('resolved');
    }
  }
  return tap({
    next: eventOrValue => {
      if (
        eventOrValue &&
        typeof eventOrValue === 'object' &&
        'type' in eventOrValue &&
        eventOrValue.type !== HttpEventType.Response
      ) {
        return;
      }
      setFn();
    },
    error: () => {
      if (isMapSignal(resourceStatusSignal)) {
        resourceStatusSignal.setKey(itemId!, 'error');
      } else {
        resourceStatusSignal.set('error');
      }
    },
  });
}
