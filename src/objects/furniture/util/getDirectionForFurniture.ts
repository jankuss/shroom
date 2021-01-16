export function getDirectionForFurniture(
  direction: number,
  validDirections: number[]
) {
  if (validDirections.length < 1) return 0;

  let fallbackDirection = validDirections[0];
  for (let i = 0; i < validDirections.length; i++) {
    const validDirection = validDirections[i];
    if (validDirection === direction) return direction;

    if (validDirection > direction) {
      return fallbackDirection;
    }

    fallbackDirection = validDirection;
  }

  return fallbackDirection;
}
