import { AvatarFigurePartType } from "../enum/AvatarFigurePartType";

const DIRECTION_IS_FLIPPED = [
  false,
  false,
  false,
  false,
  true,
  true,
  true,
  false,
];

export function getFlippedMetaData({
  assetPartDefinition,
  direction,
  partType,
  flippedPartType,
}: {
  assetPartDefinition: string;
  partType: AvatarFigurePartType;
  flippedPartType?: AvatarFigurePartType;
  direction: number;
}) {
  const directionFlipped = DIRECTION_IS_FLIPPED[direction];

  if (!directionFlipped) {
    return { direction, flip: false, partType };
  }

  if (
    assetPartDefinition === "wav" &&
    (partType == AvatarFigurePartType.LeftHand ||
      partType == AvatarFigurePartType.LeftSleeve ||
      partType == AvatarFigurePartType.LeftCoatSleeve)
  ) {
    return { direction, flip: true, partType };
  }

  if (
    assetPartDefinition == "drk" &&
    (partType == AvatarFigurePartType.RightHand ||
      partType == AvatarFigurePartType.RightSleeve ||
      partType == AvatarFigurePartType.RightCoatSleeve)
  ) {
    return { direction, flip: true, partType };
  }

  if (
    assetPartDefinition == "blw" &&
    partType == AvatarFigurePartType.RightHand
  ) {
    return { direction, flip: true, partType };
  }

  if (
    assetPartDefinition == "sig" &&
    partType == AvatarFigurePartType.LeftHand
  ) {
    return { direction, flip: true, partType };
  }

  if (
    assetPartDefinition == "respect" &&
    partType == AvatarFigurePartType.LeftHand
  ) {
    return { direction, flip: true, partType };
  }

  if (partType == AvatarFigurePartType.RightHandItem) {
    return { direction, flip: true, partType };
  }

  if (partType == AvatarFigurePartType.LeftHandItem) {
    return { direction, flip: true, partType };
  }

  if (partType == AvatarFigurePartType.ChestPrint) {
    return { direction, flip: true, partType };
  }

  let overrideDirection = direction;
  let flip = false;

  if (direction === 4) {
    overrideDirection = 2;
    flip = true;
  }

  if (direction === 5) {
    overrideDirection = 1;
    flip = true;
  }

  if (direction === 6) {
    overrideDirection = 0;
  }

  if (flippedPartType != partType && flippedPartType != null) {
    return {
      direction: overrideDirection,
      flip: false,
      partType: flippedPartType,
    };
  }

  return { direction: overrideDirection, flip: directionFlipped, partType };
}
