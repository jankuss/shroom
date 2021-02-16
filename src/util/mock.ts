export function mock<T>(value: Partial<T>): T {
  return value as T;
}
