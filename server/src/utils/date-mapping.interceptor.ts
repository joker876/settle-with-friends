import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import {
  convertStringToDate,
  deepConvertProps,
  isIsoDateString,
  isJsonLike,
} from '@shared/utils/date-mapping';
import { Observable } from 'rxjs';

@Injectable()
export class DateMappingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const http = context.switchToHttp();
    const request: any = http.getRequest();

    if (isJsonLike(request.body)) {
      request.body = deepConvertProps(
        request.body,
        (v) => typeof v === 'string' && isIsoDateString(v),
        convertStringToDate,
      );
    }

    return next.handle();
  }
}
