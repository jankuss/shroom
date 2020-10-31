export function getPosition(
  roomX: number,
  roomY: number,
  roomZ: number,
  wallOffsets: { x: number; y: number }
) {
  roomX = roomX + wallOffsets.x;
  roomY = roomY + wallOffsets.y;

  const base = 32;

  const xPos = roomX * base - roomY * base;
  const yPos = roomX * (base / 2) + roomY * (base / 2);

  return {
    x: xPos,
    y: yPos - roomZ * 32,
  };
}
