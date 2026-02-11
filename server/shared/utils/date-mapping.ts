export const ISO_DATE_TIME_REGEX =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;

export const ISO_DATE_ONLY_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export function isIsoDateString(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  if (value.length < 10 || value.length > 35) return false;

  if (ISO_DATE_TIME_REGEX.test(value) || ISO_DATE_ONLY_REGEX.test(value)) {
    const time = Date.parse(value);
    return !Number.isNaN(time);
  }
  return false;
}

export function convertStringToDate(value: unknown): Date {
  if (typeof value !== 'string') {
    throw new Error(
      'Cannot convert intercepted property to date - property is not a string',
    );
  }
  return new Date(value);
}

function isSpecialObject(value: any): boolean {
  return (
    value instanceof Date ||
    (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) ||
    (typeof Blob !== 'undefined' && value instanceof Blob) ||
    (typeof File !== 'undefined' && value instanceof File) ||
    (typeof FormData !== 'undefined' && value instanceof FormData)
  );
}

export function isJsonLike(value: any): boolean {
  if (value === null || value === undefined) return false;
  if (Array.isArray(value)) return true;

  if (typeof value === 'object') {
    if (isSpecialObject(value)) {
      return false;
    }
    return true;
  }

  return false;
}

export function deepConvertProps<T>(
  input: T,
  isFound: (v: unknown) => boolean,
  deserialize: (v: unknown) => unknown,
  seen = new WeakSet<object>(),
): T {
  if (input === null || input === undefined) return input;

  if (isFound(input)) {
    return deserialize(input) as T;
  }

  if (Array.isArray(input)) {
    return input.map((v) => deepConvertProps(v, isFound, deserialize, seen)) as unknown as T;
  }

  if (typeof input === 'object') {
    if (isSpecialObject(input)) {
      return input;
    }

    if (seen.has(input as unknown as object)) {
      return input;
    }
    seen.add(input as unknown as object);

    const output: any = Object.create(Object.getPrototypeOf(input));
    for (const [key, value] of Object.entries(input as any)) {
      output[key] = deepConvertProps(value, isFound, deserialize, seen);
    }
    return output;
  }

  return input;
}
