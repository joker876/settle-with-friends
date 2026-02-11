import { Resource } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map, Observable, of } from 'rxjs';

/**
 * Conditionally returns an observable based on a parameter expression.
 *
 * When `paramsExpression` is truthy, the original stream is returned.
 * Otherwise, an observable that emits `undefined` is returned.
 *
 * @typeParam T Type of values emitted by the observable.
 */
export function ensureParams<T>(paramsExpression: any, stream$: Observable<T>): Observable<T | undefined>;

/**
 * Overload of {@link ensureParams} that guarantees a value by providing `defaultValue`.
 *
 * When `paramsExpression` is truthy, the original stream is returned.
 * Otherwise, an observable that emits `defaultValue` is returned.
 *
 * @typeParam T Type of values emitted by the observable.
 * @param defaultValue - Value emitted when `paramsExpression` is falsy.
 */
export function ensureParams<T>(paramsExpression: any, stream$: Observable<T>, defaultValue: T): Observable<T>;
export function ensureParams<T>(
  paramsExpression: any,
  stream$: Observable<T>,
  defaultValue?: T
): Observable<T | undefined> {
  return paramsExpression ? stream$ : of(defaultValue);
}

export function isResourceResolved<T>(resource: Resource<T>): Observable<boolean> {
  return toObservable(resource.status).pipe(
    filter(status => status === 'resolved'),
    map(() => true),
  );
}