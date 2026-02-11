import { FormControl } from '@angular/forms';

export type WrapInAbstractControl<T extends Record<string, any>> = {
  [K in keyof Required<T>]: FormControl<Exclude<T[K], undefined> | null>;
};

export type RequiredNonNullable<T> = { [K in keyof T]-?: NonNullable<T[K]> };
