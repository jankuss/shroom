import { AvatarAnimationFrame } from "../data/interfaces/IAvatarAnimationData";
import { IAvatarOffsetsData } from "../data/interfaces/IAvatarOffsetsData";
import { AvatarActionInfo } from "../data/interfaces/IAvatarActionsData";
import { DIRECTION_IS_FLIPPED, getFlippedMetaData } from "./getFlippedMetaData";
import { AvatarFigurePartType } from "../enum/AvatarFigurePartType";
import { getAssetFromPartMeta } from "./getAssetFromPartMeta";

export function getAssetForFrame({
  animationFrame,
  actionData,
  partTypeFlipped,
  direction,
  partType,
  partId,
  offsetsData,
  offsetX = 0,
  offsetY = 0,
}: {
  animationFrame?: AvatarAnimationFrame;
  actionData: AvatarActionInfo;
  partTypeFlipped?: AvatarFigurePartType;
  partType: AvatarFigurePartType;
  direction: number;
  partId: string;
  offsetsData: IAvatarOffsetsData;
  offsetX?: number;
  offsetY?: number;
}) {
  const avatarFlipped = DIRECTION_IS_FLIPPED[direction];

  let assetPartDefinition = actionData.assetpartdefinition;
  let frameNumber = 0;

  if (animationFrame != null) {
    frameNumber = animationFrame.number;
    if (
      animationFrame.assetpartdefinition &&
      animationFrame.assetpartdefinition !== ""
    ) {
      assetPartDefinition = animationFrame.assetpartdefinition;
    }
  }

  const flippedMeta = getFlippedMetaData({
    assetPartDefinition,
    flippedPartType: partTypeFlipped,
    direction: direction,
    partType: partType,
  });

  let assetId = generateAssetName(
    assetPartDefinition,
    flippedMeta.partType,
    partId,
    flippedMeta.direction,
    frameNumber
  );

  let offset = offsetsData.getOffsets(assetId);

  if (offset == null) {
    assetId = generateAssetName(
      "std",
      flippedMeta.partType,
      partId,
      flippedMeta.direction,
      0
    );
    offset = offsetsData.getOffsets(assetId);
  }

  if (offset != null) {
    let flipH = flippedMeta.flip;

    if (avatarFlipped) {
      flipH = !flipH;
    }

    const asset = getAssetFromPartMeta(
      assetPartDefinition,
      { flipped: flipH, swapped: false, asset: assetId },
      offsetsData,
      { offsetX, offsetY }
    );

    if (asset != null) {
      return asset;
    }
  }
}

function generateAssetName(
  assetPartDef: string,
  partType: string,
  partId: string,
  direction: number,
  frame: number
) {
  return `h_${assetPartDef}_${partType}_${partId}_${direction}_${frame}`;
}
