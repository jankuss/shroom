export function getAvatarDirection(direction: number, offset = 0) {
  return (direction + offset) % 8;
}
