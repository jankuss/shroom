export function getMaskId(direction: number, roomX: number, roomY: number) {
  switch (direction) {
    case 2:
    case 6:
      return `x_${roomX}`;

    case 0:
    case 4:
      return `y_${roomY}`;
  }
}
