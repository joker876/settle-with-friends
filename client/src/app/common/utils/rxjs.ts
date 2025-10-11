import { HttpEventType } from '@angular/common/http';
import { ResourceStatus, WritableSignal } from '@angular/core';
import { WritableMapSignal, WritableSetSignal } from '@ardium-ui/devkit';
import { OperatorFunction, tap } from 'rxjs';

function isMapSignal<Key, T>(
  v: WritableSignal<T> | WritableMapSignal<Key, T> | WritableSetSignal<Key>
): v is WritableMapSignal<Key, T> {
  return 'setKey' in v;
}
function isSetSignal<Key, T>(
  v: WritableSignal<T> | WritableMapSignal<Key, T> | WritableSetSignal<Key>
): v is WritableSetSignal<Key> {
  return 'add' in v;
}

export function setLoadingFalse<T>(loadingSignal: WritableSignal<boolean>): OperatorFunction<T, T>;
export function setLoadingFalse<Key, T>(
  loadingIdBasedSetSignal: WritableSetSignal<Key>,
  itemId: Key
): OperatorFunction<T, T>;
export function setLoadingFalse<Key, T>(
  loadingIdBasedMapSignal: WritableMapSignal<Key, boolean>,
  itemId: Key
): OperatorFunction<T, T>;
export function setLoadingFalse<Key, T>(
  loadingSignal: WritableSignal<boolean> | WritableMapSignal<Key, boolean> | WritableSetSignal<Key>,
  itemId?: Key
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
  itemId?: Key
): OperatorFunction<T, T> {
  function setFn    (): void {
    if (isMapSignal(resourceStatusSignal)) {
      resourceStatusSignal.setKey(itemId!, ResourceStatus.Resolved);
    } else {
      resourceStatusSignal.set(ResourceStatus.Resolved);
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
        resourceStatusSignal.setKey(itemId!, ResourceStatus.Error);
      } else {
        resourceStatusSignal.set(ResourceStatus.Error);
      }
    },
  });
}
