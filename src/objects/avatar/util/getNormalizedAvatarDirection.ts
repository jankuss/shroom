export function getNormalizedAvatarDirection(
  direction: number
): {
  direction: number;
  mirrorHorizontal: boolean;
} {
  switch (direction) {
    case 0:
      return { direction: 0, mirrorHorizontal: false };
    case 1:
      return { direction: 1, mirrorHorizontal: false };
    case 2:
      return { direction: 2, mirrorHorizontal: false };
    case 3:
      return { direction: 3, mirrorHorizontal: false };
    case 4:
      return { direction: 2, mirrorHorizontal: true };
    case 5:
      return { direction: 1, mirrorHorizontal: true };
    case 6:
      return { direction: 0, mirrorHorizontal: true };
    case 7:
      return { direction: 7, mirrorHorizontal: false };
  }
  throw new Error("Invalid direction");
}
