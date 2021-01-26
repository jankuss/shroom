import { Bodypart } from "./data/interfaces/IAvatarGeometryData";
import { AvatarAction } from "../enum/AvatarAction";
import { IAvatarEffectData } from "./data/interfaces/IAvatarEffectData";
import { AvatarFigurePartType } from "../enum/AvatarFigurePartType";
import { PartData } from "./getPartDataForParsedLook";
import {
  AvatarDependencies,
  DefaultAvatarDrawPart,
  AvatarAsset,
  getAssetForFrame,
  AvatarEffectDrawPart,
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
  const drawPartMap = new Map<string, DefaultAvatarDrawPart[]>();
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
  const assets = new Map<
    string,
    {
      part: DefaultAvatarDrawPart | undefined;
      frames: Map<number, AvatarAsset>;
    }[]
  >();
  const additionalParts: AvatarEffectDrawPart[] = [];

  const getSpriteId = (member: string, direction: number, frame: number) =>
    `h_${member}_${direction}_${frame}`;

  effect.getSprites().forEach((sprite) => {
    const id = getSpriteId(sprite.member, 0, 0);
    additionalParts.push({
      kind: "EFFECT_DRAW_PART",
      assets: [{ fileId: id, library: "", mirror: false, x: 0, y: 0 }],
    });
  });

  for (let i = 0; i < frameCount; i++) {
    const effectFrameInfo = effect.getFrameBodyParts(i);
    for (const effectBodyPart of effectFrameInfo) {
      const bodyPart = bodyPartById.get(effectBodyPart.id);
      if (bodyPart == null) continue;

      const parts = getBodyPartParts(bodyPart, { partByType });
      const partIndexMap = new Map<string, number>();
      const getPartIndex = (type: string) => {
        const current = partIndexMap.get(type);
        let newValue = 0;

        if (current == null) {
          newValue = 0;
        } else {
          newValue += 1;
        }

        partIndexMap.set(type, newValue);

        return newValue;
      };

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
          const partIndex = getPartIndex(part.type);
          const currentPartArr = assets.get(part.type) ?? [];

          let current = currentPartArr[partIndex];
          if (current == null) {
            current = {
              frames: new Map<number, AvatarAsset>(),
              part: undefined,
            };
            currentPartArr.push(current);
          }

          current.frames.set(i, frame);
          current.part = {
            kind: "AVATAR_DRAW_PART",
            color: part.colorable ? `#${part.color}` : undefined,
            mode:
              part.type !== "ey" && part.colorable ? "colored" : "just-image",
            type: part.type,
            index: part.index,
            assets: [],
          };

          assets.set(part.type, currentPartArr);
        }
      }
    }
  }

  assets.forEach((arr, key) => {
    arr.forEach(({ part, frames }) => {
      const drawPartAssets: AvatarAsset[] = [];
      for (let i = 0; i < frameCount; i++) {
        const asset = frames.get(i);
        if (asset != null) {
          drawPartAssets.push(asset);
          drawPartAssets.push(asset);
        }
      }

      if (part != null) {
        const current = drawPartMap.get(key) ?? [];

        drawPartMap.set(key, [
          ...current,
          {
            ...part,
            assets: drawPartAssets,
          },
        ]);
      }
    });
  });

  return {
    drawPart: drawPartMap,
    additionalParts,
  };
}
