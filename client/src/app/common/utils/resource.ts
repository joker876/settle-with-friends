import { Resource } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map, Observable, of } from 'rxjs';

export function ensureParams<T>(paramsExpression: any, stream$: Observable<T>): Observable<T | undefined>;
export function ensureParams<T>(paramsExpression: any, stream$: Observable<T>, defaultValue: T): Observable<T>;
export function ensureParams<T>(
  paramsExpression: any,
  stream$: Observable<T>,
  defaultValue?: T,
): Observable<T | undefined> {
  return paramsExpression ? stream$ : of(defaultValue);
}

export function isResourceResolved<T>(resource: Resource<T>): Observable<boolean> {
  return toObservable(resource.status).pipe(
    filter(status => status === 'resolved'),
    map(() => true),
  );
}