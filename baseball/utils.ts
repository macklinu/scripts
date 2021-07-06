export function startsWith(string: string, options: string[]): boolean {
  return options.some((option) => string.startsWith(option));
}
