import { PluralizePLPipe } from 'ngx-polish-number-to-words';

const pluralize = new PluralizePLPipe().transform;

export const ERROR_MAP: Record<string, string | ((errorValue: any) => string)> = {
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
  payerAmountType: (errorData: { isOnlyOnePerson: boolean }) =>
    errorData.isOnlyOnePerson
      ? $localize`:@@errors.payer-amount-type.one-person:Opcja "Całość" jest już wybrana dla innej osoby`
      : $localize`:@@errors.payer-amount-type.not-one-person:Opcja "Reszta" jest już wybrana dla innej osoby`,
};
