import { Transform } from 'class-transformer';

/**
 * Property decorator that trims leading and trailing whitespace from string values.
 * Non-string values are passed through unchanged.
 *
 * @example
 * @TrimString()
 * name: string;
 */
export function TrimString(): PropertyDecorator {
  return Transform(({ value }) => (typeof value === 'string' ? value.trim() : value));
}

/**
 * Property decorator that trims leading and trailing whitespace from every string
 * element in an array. Non-array values and non-string elements are passed through unchanged.
 *
 * @example
 * @TrimStringArray()
 * skiPasses: string[] | null;
 */
export function TrimStringArray(): PropertyDecorator {
  return Transform(({ value }) =>
    Array.isArray(value) ? value.map(v => (typeof v === 'string' ? v.trim() : v)) : value,
  );
}
