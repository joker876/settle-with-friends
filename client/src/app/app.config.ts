import { DATE_PIPE_DEFAULT_OPTIONS, registerLocaleData } from '@angular/common';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import localePl from '@angular/common/locales/pl';
import { ApplicationConfig, importProvidersFrom, LOCALE_ID, provideZoneChangeDetection } from '@angular/core';
import { EVENT_MANAGER_PLUGINS } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import {
  ArdCalendarView,
  ArdDialogActionType,
  ButtonAppearance,
  ComponentColor,
  DropdownPanelAppearance,
  FormElementAppearance,
  OneAxisAlignment,
  provideBreakpoints,
  provideButtonDefaults,
  provideDateInputDefaults,
  provideDialogDefaults,
  provideErrorMap,
  provideIconButtonDefaults,
  provideInputDefaults,
  provideNumberInputDefaults,
  provideSelectDefaults,
  provideSpinnerDefaults,
} from '@ardium-ui/ui';
import { AuthInterceptor } from '@common/interceptors/auth.interceptor';
import {
  convertStringToDate,
  isIsoDateString,
  provideMappingInterceptor,
} from '@common/interceptors/date-mapping.interceptor';
import { PreventAndStopPlugin } from '@common/plugins/prevent-default-event-manager';
import { AuthService } from '@common/services/auth.service';
import { DATE_DESERIALIZATION_FN, DATE_SERIALIZATION_FN } from '@common/utils/date-serialization';
import { ERROR_MAP } from '@common/utils/errors';
import { PLURALIZE_PL_WITH_NUMBERS_DEFAULT } from 'ngx-polish-number-to-words';
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
    { provide: PLURALIZE_PL_WITH_NUMBERS_DEFAULT, useValue: true },
    provideMappingInterceptor(isIsoDateString, convertStringToDate),
    AuthService,
    provideButtonDefaults({ appearance: ButtonAppearance.Outlined, color: ComponentColor.None }),
    provideIconButtonDefaults({ color: ComponentColor.None }),
    provideDialogDefaults({
      rejectButtonAppearance: ButtonAppearance.Transparent,
      rejectButtonText: $localize`:@@common.cancel:Anuluj`,
      confirmButtonAppearance: ButtonAppearance.RaisedStrong,
      buttonActionType: ArdDialogActionType.NoOp,
    }),
    provideDateInputDefaults({
      placeholder: '',
      UTC: true,
      serializeFn: DATE_SERIALIZATION_FN,
      deserializeFn: DATE_DESERIALIZATION_FN,
      startView: ArdCalendarView.Days,
      appearance: FormElementAppearance.Filled,
    }),
    provideInputDefaults({
      placeholder: '',
      appearance: FormElementAppearance.Filled,
      autoTrim: true,
    }),
    provideSelectDefaults({
      placeholder: '',
      appearance: FormElementAppearance.Filled,
      clearButtonTitle: $localize`:@@common.clear:Wyczyść`,
      clearable: false,
      searchable: true,
      hideSelected: false,
      multiselectable: false,
      dropdownAppearance: DropdownPanelAppearance.Outlined,
      loadingPlaceholderText: $localize`:@@common.loading...:Ładowanie...`,
      noItemsFoundText: $localize`:@@common.not-found:Nie znaleziono`,
      addCustomOptionText: $localize`:@@common.create:Utwórz`,
    }),
    provideNumberInputDefaults({
      placeholder: '',
      appearance: FormElementAppearance.Filled,
      alignText: OneAxisAlignment.Left,
      noButtons: true,
      min: 0,
      allowFloat: true,
      maxDecimalPlaces: 2,
      fixedDecimalPlaces: true,
      decimalSeparator: ',',
    }),
    provideSpinnerDefaults({ color: ComponentColor.None }),
    provideErrorMap(ERROR_MAP),
    provideBreakpoints({
      sm: '37.5rem',
      md: '48rem',
      lg: '60rem',
      xl: '72rem',
      '2xl': '84rem',
      '3xl': '96rem',
    }),
  ],
};
