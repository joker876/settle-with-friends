import {
  HTTP_INTERCEPTORS,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Injectable, Provider } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

const ISO_DATE_TIME_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+\-]\d{2}:\d{2})$/;

const ISO_DATE_ONLY_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export function isIsoDateString(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  if (value.length < 10 || value.length > 35) return false;

  if (ISO_DATE_TIME_REGEX.test(value) || ISO_DATE_ONLY_REGEX.test(value)) {
    const time = Date.parse(value);
    return !Number.isNaN(time);
  }
  return false;
}
export function convertStringToDate(value: unknown) {
  if (typeof value !== 'string') {
    throw new Error('Cannot convert intercepted request property to date - porperty is not a string');
  }
  return new Date(value);
}

export function provideMappingInterceptor(
  isFound: (v: unknown) => boolean,
  deserialize: (v: unknown) => any
): Provider {
  @Injectable()
  class MappingInterceptor implements HttpInterceptor {
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
      return next.handle(request).pipe(
        map((event: HttpEvent<any>) => {
          if (!(event instanceof HttpResponse)) {
            return event;
          }

          const body = event.body;

          if (!this.isJsonLike(body)) {
            return event;
          }

          const transformed = this.convertProps(body);
          return event.clone({ body: transformed });
        })
      );
    }

    private isJsonLike(value: any): boolean {
      if (value === null || value === undefined) return false;
      if (Array.isArray(value)) return true;
      if (typeof value === 'object') {
        if (
          value instanceof Date ||
          value instanceof Blob ||
          value instanceof File ||
          value instanceof FormData ||
          value instanceof ArrayBuffer
        ) {
          return false;
        }
        return true;
      }
      return false;
    }

    private convertProps<T>(input: T, seen = new WeakSet<object>()): T {
      if (input === null || input === undefined) return input;

      if (isFound(input)) {
        return deserialize(input);
      }

      if (Array.isArray(input)) {
        return input.map(v => this.convertProps(v, seen)) as unknown as T;
      }

      if (typeof input === 'object') {
        if (
          input instanceof Date ||
          input instanceof Blob ||
          input instanceof File ||
          input instanceof FormData ||
          input instanceof ArrayBuffer
        ) {
          return input;
        }

        if (seen.has(input as unknown as object)) {
          return input;
        }
        seen.add(input as unknown as object);

        const output: any = Object.create(Object.getPrototypeOf(input));
        for (const [key, value] of Object.entries(input as any)) {
          output[key] = this.convertProps(value, seen);
        }
        return output;
      }

      return input;
    }
  }

  return {
    provide: HTTP_INTERCEPTORS,
    multi: true,
    useClass: MappingInterceptor,
  };
}
