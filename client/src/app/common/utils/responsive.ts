import { coerceArrayProperty, coerceNumberProperty } from '@ardium-ui/devkit';

/**
 * Configuration for responsive numeric values.
 *
 * Values represent breakpoints for base, small, medium, large and extra-large.
 */
export interface ResponsiveConfig {
  base: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
}

/**
 * Normalizes various responsive value representations into a full {@link ResponsiveConfig}.
 *
 * - `number`: same value is applied to all breakpoints.
 * - `string`: either a single number or a space-separated breakpoint list
 *   like `"base:1 sm:2 md:3 lg:4 xl:5"`.
 * - `ResponsiveConfig`: missing breakpoints are filled based on smaller ones.
 */
export const transformResponsiveValue: (v: number | string | ResponsiveConfig) => Required<ResponsiveConfig> = v => {
  if (typeof v === 'number') {
    return { base: v, sm: v, md: v, lg: v, xl: v };
  }
  if (typeof v === 'string') {
    const num = coerceNumberProperty(v);
    if (num !== undefined) {
      return { base: num, sm: num, md: num, lg: num, xl: num };
    }
    // parse string like "base:1 sm:2 md:3 lg:4 xl:5"
    const items = coerceArrayProperty(v, ' ')
      .map(item => {
        const [breakpointOrValue, value] = item.split(':');
        return {
          breakpoint: value ? breakpointOrValue.trim() : undefined,
          value: coerceNumberProperty(value ? value.trim() : breakpointOrValue.trim()),
        };
      })
      .reduce(
        (acc, curr) => {
          if (curr.value !== undefined) {
            acc[curr.breakpoint || 'base'] = curr.value;
          }
          return acc;
        },
        {} as Record<string, number>
      );
    // construct proper object
    v = {
      base: items['base'] ?? 1,
      sm: items['sm'],
      md: items['md'],
      lg: items['lg'],
      xl: items['xl'],
    };
  }
  // construct full object
  const base = v.base;
  const sm = v.sm ?? base;
  const md = v.md ?? sm;
  const lg = v.lg ?? md;
  const xl = v.xl ?? lg;
  return { base, sm, md, lg, xl };
};
