export function getAvatarDirection(direction: number): number {
  if (direction < -8) {
    return 0;
  }

  if (direction > 15) {
    return 0;
  }

  if (direction < 0) {
    return direction + 8;
  }

  if (direction > 7) {
    return direction - 8;
  }

  return direction;
}
