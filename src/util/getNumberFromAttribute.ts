export function getNumberFromAttribute(
  value: string | null
): number | undefined {
  if (value == null) return;

  const numberValue = Number(value);
  if (isNaN(numberValue)) return;

  return numberValue;
}
