import { AvatarFigurePartType } from "../enum/AvatarFigurePartType";

export const DIRECTION_IS_FLIPPED = [
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
    return { direction, flip: false, partType, swapped: false };
  }

  if (
    assetPartDefinition === "wav" &&
    (partType == AvatarFigurePartType.LeftHand ||
      partType == AvatarFigurePartType.LeftSleeve ||
      partType == AvatarFigurePartType.LeftCoatSleeve)
  ) {
    return { direction, flip: true, partType, swapped: false };
  }

  if (
    assetPartDefinition == "drk" &&
    (partType == AvatarFigurePartType.RightHand ||
      partType == AvatarFigurePartType.RightSleeve ||
      partType == AvatarFigurePartType.RightCoatSleeve)
  ) {
    return { direction, flip: true, partType, swapped: false };
  }

  if (
    assetPartDefinition == "blw" &&
    partType == AvatarFigurePartType.RightHand
  ) {
    return { direction, flip: true, partType, swapped: false };
  }

  if (
    assetPartDefinition == "sig" &&
    partType == AvatarFigurePartType.LeftHand
  ) {
    return { direction, flip: true, partType, swapped: false };
  }

  if (
    assetPartDefinition == "respect" &&
    partType == AvatarFigurePartType.LeftHand
  ) {
    return { direction, flip: true, partType, swapped: false };
  }

  if (partType == AvatarFigurePartType.RightHandItem) {
    return { direction, flip: true, partType, swapped: false };
  }

  if (partType == AvatarFigurePartType.LeftHandItem) {
    return { direction, flip: true, partType, swapped: false };
  }

  if (partType == AvatarFigurePartType.ChestPrint) {
    return { direction, flip: true, partType, swapped: false };
  }

  let overrideDirection = direction;

  if (direction === 4) {
    overrideDirection = 2;
  }

  if (direction === 5) {
    overrideDirection = 1;
  }

  if (direction === 6) {
    overrideDirection = 0;
  }

  if (flippedPartType != partType) {
    return {
      direction: overrideDirection,
      flip: false,
      partType: flippedPartType ?? partType,
      swapped: true,
    };
  }

  return { direction: overrideDirection, flip: false, partType };
}
