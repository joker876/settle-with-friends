import { FormControl } from '@angular/forms';

// Allow both nullable and non-nullable controls for the same models field, so we don't have to change every control.
export type WrapInAbstractControl<T extends Record<string, any>> = {
  [K in keyof T]: FormControl<T[K]>;
};

export type RequiredNonNullable<T> = { [K in keyof T]-?: NonNullable<T[K]> };
