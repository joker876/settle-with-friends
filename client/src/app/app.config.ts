import { DATE_PIPE_DEFAULT_OPTIONS } from '@angular/common';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ApplicationConfig, LOCALE_ID, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { AuthInterceptor } from '@common/interceptors/auth.interceptor';
import { convertStringToDate, isIsoDateString, provideMappingInterceptor } from '@common/interceptors/date-mapping.interceptor';
import { AuthService } from '@common/services/auth.service';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    // provideDateInputDefaults({
    //   placeholder: '',
    //   UTC: true,
    //   serializeFn: DATE_SERIALIZATION_FN,
    //   deserializeFn: DATE_DESERIALIZATION_FN,
    //   min: new Date(1901, 0, 1),
    //   max: new Date(),
    //   startView: ArdCalendarView.Years,
    // }),
    AuthService,
    { provide: LOCALE_ID, useValue: 'pl-PL' },
    { provide: DATE_PIPE_DEFAULT_OPTIONS, useValue: { timezone: '+0000' } },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    provideMappingInterceptor(isIsoDateString, convertStringToDate),
  ],
};
