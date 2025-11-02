import { Pipe, PipeTransform } from '@angular/core';
import { ValidationErrors } from '@angular/forms';
import { ErrorCode } from '@shared/enums/error-code';
import { PluralizePLPipe } from 'ngx-polish-number-to-words';

const pluralize = new PluralizePLPipe().transform;

const ERROR_MAP: Record<string, string | ((errorValue: any) => string)> = {
  //! form errors
  required: $localize`:@@errors.required:To pole jest wymagane`,
  minlength: (errorData: { requiredLength: number }) =>
    $localize`:@@errors.min-length:Wpisz co najmniej ${errorData.requiredLength} ${pluralize(
      errorData.requiredLength,
      'znak',
      'znaki',
      'znaków',
    )}`,
  maxlength: (errorData: { requiredLength: number; actualLength: number }) =>
    $localize`:@@errors.max-length:Przekroczono limit znaków (${errorData.actualLength}/${errorData.requiredLength})`,
  email: $localize`:@@errors.invalid-email:Wpisz poprawny adres email`,
  pattern: (errorData: { requiredPattern: string }) => {
    if (errorData.requiredPattern === '^\\d{11}$') {
      return $localize`:@@errors.pesel-length:PESEL musi składać się z 11 cyfr`;
    }
    if (errorData.requiredPattern.includes('[a-zA-Z') || errorData.requiredPattern.includes('ąćęłńóśźż')) {
      return $localize`:@@errors.letters-only:Pole może zawierać tylko litery`;
    }
    return $localize`:@@errors.invalid-format:Nieprawidłowy format`;
  },
};

@Pipe({
  name: 'mapError',
  pure: true,
})
export class MapErrorPipe implements PipeTransform {
  transform(ngControlErrors: ValidationErrors | null | undefined | string): string | null {
    if (!ngControlErrors) {
      return null;
    }

    if (typeof ngControlErrors === 'string') {
      const errorValue = ERROR_MAP[ngControlErrors];
      return (
        (typeof errorValue === 'function' ? errorValue({}) : errorValue) ||
        (ERROR_MAP[ErrorCode.UNKNOWN_ERROR] as string)
      );
    }

    if (typeof ngControlErrors === 'object' && Object.keys(ngControlErrors).length === 0) {
      return null;
    }

    for (const errorType in ERROR_MAP) {
      if (errorType in ngControlErrors) {
        const valueOrFn = ERROR_MAP[errorType];
        if (typeof valueOrFn === 'function') {
          return valueOrFn(ngControlErrors[errorType]) as string;
        } else {
          return valueOrFn as string;
        }
      }
    }
    return JSON.stringify(ngControlErrors);
  }
}
