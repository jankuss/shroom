import { ParsedLook } from "./parseLookString";
import { GetSetType } from "./parseFigureData";
import { getNormalizedAvatarDirection } from "./getNormalizedAvatarDirection";
import { GetDrawOrder } from "./parseDrawOrder";
import { filterDrawOrder } from "./filterDrawOrder";
import { getNormalizedPart } from "./getNormalizedPart";
import { GetOffset } from "./loadOffsetMap";
import { notNullOrUndefined } from "../../../util/notNullOrUndefined";
import { getActionForPart } from "./getActionForPart";
import { getDrawOrder } from "./drawOrder";
import { avatarAnimations } from "./avatarAnimations";
import { IAvatarAnimationData } from "./data/IAvatarAnimationData";
import { IAvatarPartSetsData } from "./data/IAvatarPartSetsData";
import { IAvatarOffsetsData } from "./data/IAvatarOffsetsData";
import { IFigureMapData } from "./data/IFigureMapData";
import { IFigureData } from "./data/IFigureData";
import { Bodypart, IAvatarGeometryData } from "./data/IAvatarGeometryData";
import { AvatarAction } from "../enum/AvatarAction";
import {
  AvatarActionInfo,
  IAvatarActionsData,
} from "./data/IAvatarActionsData";
import { IAvatarEffectData } from "./data/IAvatarEffectData";
import { DIRECTION_IS_FLIPPED, getFlippedMetaData } from "./getFlippedMetaData";
import { AvatarFigurePartType } from "../enum/AvatarFigurePartType";

export type AvatarAsset = {
  fileId: string;
  x: number;
  y: number;
  library: string;
  mirror: boolean;
};

export type AvatarDrawPart = {
  type: string;
  assets: AvatarAsset[];
  color: string | undefined;
  mode: "colored" | "just-image";
};

export interface AvatarDrawDefinition {
  mirrorHorizontal: boolean;
  parts: AvatarDrawPart[];
  offsetX: number;
  offsetY: number;
}

export interface AvatarDependencies {
  figureData: IFigureData;
  figureMap: IFigureMapData;
  offsetsData: IAvatarOffsetsData;
  animationData: IAvatarAnimationData;
  partSetsData: IAvatarPartSetsData;
  geometry: IAvatarGeometryData;
  actionsData: IAvatarActionsData;
}

interface Options {
  parsedLook: ParsedLook;
  actions: Set<string>;
  direction: number;
  frame: number;
  item?: string | number;
  effect?: IAvatarEffectData;
}

export interface PartData {
  color: string | undefined;
  id: string;
  type: string;
  colorable: boolean;
  hiddenLayers: string[];
}

export interface PartDataWithBodyPart extends PartData {
  bodypart: Bodypart;
}

/**
 * Returns a definition of how the avatar should be drawn.
 * @param options Look options
 * @param dependencies External figure data, draw order and offsets
 */
export function getAvatarDrawDefinition(
  {
    parsedLook,
    actions: initialActions,
    direction,
    item: itemId,
    effect,
  }: Options,
  deps: AvatarDependencies
): AvatarDrawDefinition | undefined {
  const actions = new Set(initialActions).add(AvatarAction.Default);

  const {
    offsetsData,
    animationData,
    partSetsData,
    actionsData,
    figureData,
    figureMap,
    geometry,
  } = deps;

  const activeActions = actionsData
    .getActions()
    .filter((info) => actions.has(info.id))
    .sort((a, b) => {
      if (a.precedence < b.precedence) return 1;
      if (a.precedence > b.precedence) return -1;

      return 0;
    });

  const partByType = new Map<string, PartData[]>();

  Array.from(parsedLook.entries()).forEach(([type, { setId, colorId }]) => {
    const parts = figureData.getParts(type, setId.toString());
    const colorValue = figureData.getColor(type, colorId.toString());
    const hiddenLayers: string[] = [];

    parts?.forEach((part) => {
      const current = partByType.get(part.type) ?? [];

      partByType.set(part.type, [
        ...current,
        { ...part, color: colorValue, hiddenLayers },
      ]);
    });

    return (parts || []).map((part) => ({
      ...part,
      color: colorValue,
      hiddenLayers,
    }));
  });

  // Normalize the direction, since the only available directions are 0, 1, 2, 3 and 7.
  // Every other direction can be displayed by mirroring one of the above.
  const normalizedDirection = getNormalizedAvatarDirection(direction);

  let drawPartMap = new Map<string, AvatarDrawPart[]>();
  const activePartSets = new Set<string>();

  activeActions.forEach((info) => {
    if (info.activepartset != null) {
      activePartSets.add(info.activepartset);
    }
  });

  if (itemId != null) {
    activePartSets.add("itemRight");
  }

  function getDrawOrderType() {
    if (activePartSets.has("handLeft")) {
      return "lh-up";
    }

    if (
      activePartSets.has("handRightAndHead") ||
      activePartSets.has("handRight")
    ) {
      return "rh-up";
    }

    return "std";
  }

  let drawOrderRaw =
    getDrawOrder(getDrawOrderType(), direction) ||
    getDrawOrder("std", direction);

  const drawOrderAdditional = filterDrawOrder(new Set(drawOrderRaw));

  const bodyParts = geometry
    .getBodyParts("full")
    .map((id) => geometry.getBodyPart("vertical", id))
    .filter(notNullOrUndefined)
    .sort((a, b) => b.z - a.z);

  bodyParts.forEach((bodyPart) => {
    const parts = bodyPart.items
      .flatMap((item) => {
        const partsForType = partByType.get(item.id);
        if (partsForType == null) return [];

        return partsForType;
      })
      .map((part) => ({ ...part, bodypart: bodyPart }));

    activeActions.forEach((action) => {
      const localDrawPartMap = new Map<string, AvatarDrawPart[]>();

      const drawParts = getBodyPart(
        {
          actionData: action,
          frame: 0,
          direction,
          parts,
          bodyPartId: bodyPart.id,
        },
        deps
      );

      drawParts.forEach((part) => {
        const existing = localDrawPartMap.get(part.type) ?? [];
        localDrawPartMap.set(part.type, [...existing, part]);
      });

      localDrawPartMap.forEach((parts, key) => drawPartMap.set(key, parts));
    });
  });

  const drawParts = drawOrderAdditional
    .flatMap((partType) => drawPartMap.get(partType))
    .filter(notNullOrUndefined);

  if (direction === 4) {
    console.log("DRAW PARTS", drawParts);
  }

  return {
    parts: drawParts,
    mirrorHorizontal: false,
    offsetX: 0,
    offsetY: 0,
  };
}

function getBodyPart(
  {
    actionData,
    direction,
    frame,
    parts,
    bodyPartId,
  }: {
    parts: PartDataWithBodyPart[];
    bodyPartId: string;
    actionData: AvatarActionInfo;
    direction: number;
    itemId?: string | number;
    validBodyParts?: Set<string>;
    frame: number;
  },
  {
    offsetsData,
    animationData,
    partSetsData,
    actionsData,
    figureData,
    figureMap,
    geometry,
  }: AvatarDependencies
): AvatarDrawPart[] {
  if (actionData == null) throw new Error("Invalid action data");

  let remainingPartCount = parts.length - 1;
  let assetPartDefinition = actionData.assetpartdefinition;

  const avatarFlipped = DIRECTION_IS_FLIPPED[direction];
  const resolvedParts: AvatarDrawPart[] = [];

  while (remainingPartCount >= 0) {
    const part = parts[remainingPartCount];
    const frames = animationData.getAnimationFrames(actionData.id, part.type);
    const animationFrame = frames[frame % frames.length];

    let frameNumber = -1;

    if (animationFrame != null) {
      frameNumber = animationFrame.number;
      if (
        animationFrame.assetpartdefinition &&
        !(animationFrame.assetpartdefinition == "")
      ) {
        assetPartDefinition = animationFrame.assetpartdefinition;
      }
    }

    const partInfo = partSetsData.getPartInfo(part.type);

    const partTypeFlipped = partInfo?.flippedSetType as
      | AvatarFigurePartType
      | undefined;
    const flippedMeta = getFlippedMetaData({
      assetPartDefinition,
      flippedPartType: partTypeFlipped,
      direction,
      partType: part.type as AvatarFigurePartType,
    });

    let assetId = generateAssetName(
      assetPartDefinition,
      flippedMeta.partType,
      part.id,
      direction,
      frameNumber
    );
    let offset = offsetsData.getOffsets(assetId);

    if (offset == null) {
      assetId = generateAssetName(
        "std",
        flippedMeta.partType,
        part.id,
        flippedMeta.direction,
        0
      );
      offset = offsetsData.getOffsets(assetId);
    }

    if (offset != null) {
      let flipH = flippedMeta.flip;
      const swapped = flippedMeta.flip;

      if (avatarFlipped) {
        flipH = !flipH;
      }

      const libraryId = figureMap.getLibraryOfPart(
        part.id,
        flippedMeta.partType
      );

      if (libraryId != null) {
        const asset = getAssetFromPartMeta(
          libraryId,
          { flipped: flipH, swapped: false, asset: assetId },
          offsetsData
        );

        if (asset != null) {
          resolvedParts.push({
            assets: [asset],
            color: part.colorable ? `#${part.color}` : undefined,
            mode:
              part.type !== "ey" && part.colorable ? "colored" : "just-image",
            type: part.type,
          });
        }
      }
    }

    if (
      actionData.id === "Respect" &&
      direction === 4 &&
      bodyPartId === "handRight"
    ) {
      console.log("ABC", actionData, resolvedParts);
    }

    remainingPartCount--;
  }

  return resolvedParts;
}

function getAssetFromPartMeta(
  libraryId: string,
  assetInfoFrame: { flipped: boolean; swapped: boolean; asset: string },
  offsetsData: IAvatarOffsetsData
) {
  const offsets = offsetsData.getOffsets(assetInfoFrame.asset);

  if (offsets == null) return;

  let offsetsX = 0;
  let offsetsY = 0;

  offsetsY = -offsets.offsetY;

  if (assetInfoFrame.flipped) {
    offsetsX = 64 + offsets.offsetX;
  } else {
    offsetsX = -offsets.offsetX;
  }

  if (assetInfoFrame.swapped) {
    offsetsX += 100;
  }

  return {
    fileId: assetInfoFrame.asset,
    library: libraryId,
    mirror: assetInfoFrame.flipped,
    x: offsetsX,
    y: offsetsY + 16,
  };
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
/*
function enhancePartsWithEffects(
  {
    effect,
    direction,
    drawPartMap: dpm,
    partByType,
  }: {
    effect: IAvatarEffectData;
    direction: number;
    partByType: Map<string, PartData[]>;
    drawPartMap: Map<string, AvatarDrawPart[]>;
  },
  deps: AvatarDependencies
) {
  const drawPartMap = new Map(dpm);
  const effectFrameCount = effect.getFrameCount();
  const effectMap = new Map<string, AvatarDrawPart[]>();

  const {
    offsetsData,
    actionsData,
    animationData,
    figureMap,
    geometry,
    figureData,
    partSetsData,
  } = deps;

  const map: Map<string, Map<number, Map<number, AvatarAsset[]>>> = new Map();

  for (
    let effectFrameIndex = 0;
    effectFrameIndex < effectFrameCount;
    effectFrameIndex++
  ) {
    const frameParts = effect.getFrameParts(effectFrameIndex);

    frameParts.forEach((framePart, framePartIndex) => {
      const actionData = actionsData.getAction(
        framePart.action as AvatarAction
      );
      const defaultActionData = actionsData.getAction(AvatarAction.Default);
      if (actionData == null) return;
      if (defaultActionData == null) return;

      const parts = new Map<string, AvatarDrawPart[]>();

      getActionParts(
        {
          actionData: defaultActionData,
          partByType,
          direction,
          frame: framePart.frame,
          validBodyParts: new Set([framePart.id]),
        },
        deps
      ).parts.forEach((part, key) => {
        parts.set(key, part);
      });

      getActionParts(
        {
          actionData,
          direction,
          partByType,
          validBodyParts: new Set([framePart.id]),
          frame: framePart.frame,
        },
        deps
      ).parts.forEach((part, key) => {
        parts.set(key, part);
      });

      parts.forEach((parts, partKey) => {
        const existing =
          map.get(partKey) ?? new Map<number, Map<number, AvatarAsset[]>>();

        parts.forEach((part, partIndex) => {
          const existingAssets =
            existing.get(partIndex) ?? new Map<number, AvatarAsset[]>();

          existingAssets.set(
            effectFrameIndex,
            part.assets.map(
              (asset): AvatarAsset => ({
                ...asset,
                x: asset.x + framePart.dx,
                y: asset.y + framePart.dy,
              })
            )
          );
          existing.set(partIndex, existingAssets);
        });

        map.set(partKey, existing);
      });
    });

    map.forEach((parts, partKey) => {
      const fallbackParts = drawPartMap.get(partKey) ?? [];

      drawPartMap.set(
        partKey,
        fallbackParts.map((fallbackPart, partIndex) => {
          const assetByFrame = parts.get(partIndex);

          const assets = new Array(effectFrameCount)
            .fill(0)
            .flatMap((_, index) => {
              const insertIndex = index;
              const effectAsset = assetByFrame?.get(index);

              if (effectAsset == null || effectAsset.length < 2) {
                return [];
              }

              return effectAsset;
            });

          return { ...fallbackPart, assets };
        })
      );
    });
  }

  return drawPartMap;
}
*/
