import { DATE_PIPE_DEFAULT_OPTIONS, registerLocaleData } from '@angular/common';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import localePl from '@angular/common/locales/pl';
import { ApplicationConfig, importProvidersFrom, LOCALE_ID, provideZoneChangeDetection } from '@angular/core';
import { EVENT_MANAGER_PLUGINS } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import {
  ButtonAppearance,
  ComponentColor,
  provideButtonDefaults,
  provideDialogDefaults,
  provideIconButtonDefaults,
} from '@ardium-ui/ui';
import { AuthInterceptor } from '@common/interceptors/auth.interceptor';
import {
  convertStringToDate,
  isIsoDateString,
  provideMappingInterceptor,
} from '@common/interceptors/date-mapping.interceptor';
import { PreventAndStopPlugin } from '@common/plugins/prevent-default-event-manager';
import { AuthService } from '@common/services/auth.service';
import { TimeagoCustomFormatter, TimeagoFormatter, TimeagoIntl, TimeagoModule } from 'ngx-timeago';
import { routes } from './app.routes';

registerLocaleData(localePl);

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    importProvidersFrom(
      TimeagoModule.forRoot({
        // enable i18n-able formatter + the intl service
        formatter: { provide: TimeagoFormatter, useClass: TimeagoCustomFormatter },
        intl: { provide: TimeagoIntl, useClass: TimeagoIntl },
      }),
    ),
    { provide: LOCALE_ID, useValue: 'pl-PL' },
    { provide: DATE_PIPE_DEFAULT_OPTIONS, useValue: { timezone: '+0000', format: 'dd MMM yyyy, hh:mm:ss' } },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    { provide: EVENT_MANAGER_PLUGINS, useClass: PreventAndStopPlugin, multi: true },
    provideMappingInterceptor(isIsoDateString, convertStringToDate),
    AuthService,
    provideButtonDefaults({ appearance: ButtonAppearance.Outlined, color: ComponentColor.None }),
    provideIconButtonDefaults({ color: ComponentColor.None }),
    provideDialogDefaults({
      rejectButtonAppearance: ButtonAppearance.Transparent,
      rejectButtonText: $localize`:@@common.cancel:Anuluj`,
      confirmButtonAppearance: ButtonAppearance.RaisedStrong,
    }),
    // provideDateInputDefaults({
    //   placeholder: '',
    //   UTC: true,
    //   serializeFn: DATE_SERIALIZATION_FN,
    //   deserializeFn: DATE_DESERIALIZATION_FN,
    //   min: new Date(1901, 0, 1),
    //   max: new Date(),
    //   startView: ArdCalendarView.Years,
    // }),
  ],
};
