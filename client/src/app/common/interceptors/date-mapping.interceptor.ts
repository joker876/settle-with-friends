import {
    HTTP_INTERCEPTORS,
    HttpEvent,
    HttpHandler,
    HttpInterceptor,
    HttpRequest,
    HttpResponse,
} from '@angular/common/http';
import { Injectable, Provider } from '@angular/core';
import {
    deepConvertProps,
    isJsonLike
} from '@shared/utils/date-mapping';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export { convertStringToDate, isIsoDateString } from '@shared/utils/date-mapping';

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

          if (!isJsonLike(body)) {
            return event;
          }

          const transformed = deepConvertProps(body, isFound, deserialize);
          return event.clone({ body: transformed });
        })
      );
    }
  }

  return {
    provide: HTTP_INTERCEPTORS,
    multi: true,
    useClass: MappingInterceptor,
  };
}
