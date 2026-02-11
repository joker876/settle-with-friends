/**
 * Generic option models for selectable UI controls (e.g. selects, radios).
 *
 * @template T Type of the underlying option value.
 */
export interface SelectableOption<T = any> {
  /** Display label shown to the user. */
  label: string;
  /** Value associated with the option. */
  value: T;
  /** Optional label to show when the option is selected. */
  selectedLabel?: string;
}
