export function expandToLabelValue(options: string[]): { label: string; value: string }[] {
  return options.map(v => ({ label: v, value: v }));
}
