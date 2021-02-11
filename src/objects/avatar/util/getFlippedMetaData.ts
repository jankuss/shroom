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

  const overrideDirection = getBasicFlippedMetaData(direction);

  if (flippedPartType != partType) {
    return {
      direction: overrideDirection.direction,
      flip: false,
      partType: flippedPartType ?? partType,
      swapped: true,
    };
  }

  return { direction: overrideDirection.direction, flip: false, partType };
}

export function getBasicFlippedMetaData(direction: number) {
  let overrideDirection = direction;
  let flipped = false;

  if (direction === 4) {
    overrideDirection = 2;
    flipped = true;
  }

  if (direction === 5) {
    overrideDirection = 1;
    flipped = true;
  }

  if (direction === 6) {
    overrideDirection = 0;
    flipped = true;
  }

  return { direction: overrideDirection, flip: flipped };
}

export function getPartFlippedMetaData(
  direction: number,
  {
    partType,
    flippedPartType,
  }: {
    partType?: AvatarFigurePartType;
    flippedPartType?: AvatarFigurePartType;
  }
) {
  const overrideDirection = getBasicFlippedMetaData(direction);

  if (flippedPartType != partType) {
    return {
      direction: overrideDirection.direction,
      flip: false,
      partType: flippedPartType ?? partType,
      swapped: true,
    };
  }

  return { direction: overrideDirection.direction, flip: false, partType };
}
