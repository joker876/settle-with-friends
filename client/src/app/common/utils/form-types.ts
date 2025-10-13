import { FormControl } from '@angular/forms';

export type WrapInAbstractControl<T extends Record<string, any>> = {
  [K in keyof T]: FormControl<T[K] | null>;
};

export type RequiredNonNullable<T> = { [K in keyof T]-?: NonNullable<T[K]> };
