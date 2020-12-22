import { AvatarFigurePartType } from "../enum/AvatarFigurePartType";

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
  if (
    assetPartDefinition === "wav" &&
    (partType == AvatarFigurePartType.LeftHand ||
      partType == AvatarFigurePartType.LeftSleeve ||
      partType == AvatarFigurePartType.LeftCoatSleeve)
  ) {
    return { direction, flip: true, partType: partType };
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

  if (direction === 4) {
    overrideDirection = direction;
  }

  if (direction === 5) {
    overrideDirection = direction;
  }

  if (direction === 6) {
    overrideDirection = direction;
  }

  if (flippedPartType != partType && flippedPartType != null) {
    return {
      direction: overrideDirection,
      flip: false,
      partType: flippedPartType,
    };
  }

  return { direction: overrideDirection, flip: false, partType };
}
