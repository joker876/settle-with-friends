import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { HTTP_INTERCEPTORS, provideHttpClient } from '@angular/common/http';
import { AuthInterceptor } from '@common/interceptors/auth.interceptor';
import {
  convertStringToDate,
  isIsoDateString,
  provideMappingInterceptor
} from '@common/interceptors/date-mapping.interceptor';
import { HttpService } from '@common/services/http.service';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    HttpService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    provideMappingInterceptor(isIsoDateString, convertStringToDate),
  ],
};
