import { Bodypart } from "./data/interfaces/IAvatarGeometryData";
import { AvatarAction } from "../enum/AvatarAction";
import { IAvatarEffectData } from "./data/interfaces/IAvatarEffectData";
import { AvatarFigurePartType } from "../enum/AvatarFigurePartType";
import { PartData } from "./getPartDataForParsedLook";
import {
  AvatarDependencies,
  AvatarDrawPart,
  AvatarAsset,
  getAssetForFrame,
} from "./getAvatarDrawDefinition";
import { getBodyPartParts } from "./getBodyPartParts";

export function getEffectDrawParts(
  effect: IAvatarEffectData,
  options: {
    bodyPartById: Map<string, Bodypart>;
    partByType: Map<string, PartData[]>;
    direction: number;
  },
  dependencies: AvatarDependencies
) {
  const drawPartMap = new Map<string, AvatarDrawPart[]>();
  const { bodyPartById, partByType, direction } = options;
  const {
    partSetsData,
    actionsData,
    animationData,
    figureMap,
    figureData,
    offsetsData,
  } = dependencies;

  const frameCount = effect.getFrameCount();
  const assets = new Map<string, Map<number, AvatarAsset>>();
  const drawParts = new Map<string, AvatarDrawPart>();
  const partIndexMap = new Map<string, number>();

  for (let i = 0; i < frameCount; i++) {
    const effectFrameInfo = effect.getFrameParts(i);
    for (const effectBodyPart of effectFrameInfo) {
      const bodyPart = bodyPartById.get(effectBodyPart.id);
      if (bodyPart == null) continue;

      const parts = getBodyPartParts(bodyPart, { partByType });
      for (const part of parts) {
        const partInfo = partSetsData.getPartInfo(part.type);
        if (partInfo == null) continue;

        const actionData = actionsData.getAction(
          effectBodyPart.action as AvatarAction
        );
        if (actionData == null) continue;

        const animationFrame = animationData.getAnimationFrame(
          actionData.id,
          part.type,
          effectBodyPart.frame
        );

        const frame = getAssetForFrame({
          animationFrame: animationFrame,
          actionData,
          partId: part.id,
          partType: part.type as AvatarFigurePartType,
          partTypeFlipped: partInfo.flippedSetType as AvatarFigurePartType,
          direction: direction + effectBodyPart.dd,
          setId: part.setId,
          setType: part.setType,
          figureData,
          figureMap,
          offsetsData,
          offsetX: effectBodyPart.dx,
          offsetY: effectBodyPart.dy,
        });

        if (frame != null) {
          const current =
            assets.get(part.type) ?? new Map<number, AvatarAsset>();
          current.set(i, frame);

          assets.set(part.type, current);
        }

        const drawPart: AvatarDrawPart = {
          color: part.colorable ? `#${part.color}` : undefined,
          mode: part.type !== "ey" && part.colorable ? "colored" : "just-image",
          type: part.type,
          index: part.index,
          assets: [],
        };

        drawParts.set(part.type, drawPart);
      }
    }
  }

  drawParts.forEach((drawPart, key) => {
    const assetMap: Map<number, AvatarAsset> =
      assets.get(drawPart.type) ?? new Map();

    const drawPartAssets: AvatarAsset[] = [];
    for (let i = 0; i < frameCount; i++) {
      const asset = assetMap.get(i);
      if (asset != null) {
        drawPartAssets.push(asset);
        drawPartAssets.push(asset);
      }
    }

    drawPartMap.set(key, [
      {
        ...drawPart,
        assets: drawPartAssets,
      },
    ]);
  });

  return drawPartMap;
}
