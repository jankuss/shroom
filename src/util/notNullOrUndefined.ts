export function notNullOrUndefined<T>(value: T | null | undefined): value is T {
  return value != null;
}
