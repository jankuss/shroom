export function associateBy<T>(arr: T[], getKey: (value: T) => string) {
  const map = new Map<string, T>();
  arr.forEach((value) => {
    const key = getKey(value);
    map.set(key, value);
  });

  return map;
}
