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
import { IAvatarGeometryData } from "./data/IAvatarGeometryData";
import { AvatarAction } from "../enum/AvatarAction";
import {
  AvatarActionInfo,
  IAvatarActionsData,
} from "./data/IAvatarActionsData";
import { AvatarEffectData } from "./data/AvatarEffectData";
import { IAvatarEffectData } from "./data/IAvatarEffectData";
import { dir } from "console";

export type AvatarAsset = {
  fileId: string;
  x: number;
  y: number;
  library: string;
  mirror: boolean;
};

export type AvatarDrawPart = {
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

export type PartData = {
  color: string | undefined;
  id: string;
  type: string;
  colorable: boolean;
  hiddenLayers: string[];
};

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
  {
    offsetsData,
    animationData,
    partSetsData,
    actionsData,
    figureData,
    figureMap,
    geometry,
  }: AvatarDependencies
): AvatarDrawDefinition | undefined {
  const actions = new Set(initialActions).add(AvatarAction.Default);

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
    const drawParts = getActionParts(
      { partByType, direction, actionData: info, itemId },
      {
        offsetsData,
        animationData,
        partSetsData,
        actionsData,
        figureData,
        figureMap,
        geometry,
      }
    );

    drawParts.parts.forEach((part, key) => {
      drawPartMap.set(key, part);
    });

    if (drawParts.activePartSet != null) {
      activePartSets.add(drawParts.activePartSet);
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

  if (effect != null) {
    drawPartMap = enhancePartsWithEffects(
      {
        effect,
        drawPartMap,
        partByType,
        direction,
      },
      {
        actionsData,
        animationData,
        figureData,
        figureMap,
        geometry,
        offsetsData,
        partSetsData,
      }
    );
  }

  return {
    parts: drawOrderAdditional
      .flatMap((partType) => drawPartMap.get(partType))
      .filter(notNullOrUndefined),
    mirrorHorizontal: false,
    offsetX: 0,
    offsetY: 0,
  };
}

function getActionParts(
  {
    actionData,
    direction,
    partByType,
    itemId,
    validBodyParts,
    frame,
  }: {
    partByType: Map<
      string,
      {
        color: string | undefined;
        id: string;
        type: string;
        colorable: boolean;
        hiddenLayers: string[];
      }[]
    >;
    actionData: AvatarActionInfo;
    direction: number;
    itemId?: string | number;
    validBodyParts?: Set<string>;
    frame?: number;
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
): {
  parts: Map<string, AvatarDrawPart[]>;
  activePartSet: string | null;
  mirrorHorizontal: boolean;
  hiddenLayers: Set<string>;
} {
  const map = new Map<string, AvatarDrawPart[]>();
  const hiddenLayers = new Set<string>();

  const normalizedDirection = getNormalizedAvatarDirection(direction);

  if (actionData == null) throw new Error("Invalid action data");

  const bodyParts = geometry
    .getBodyParts("full")
    .map((id) => geometry.getBodyPart("vertical", id))
    .filter(notNullOrUndefined)
    .sort((a, b) => b.z - a.z);

  for (let i = 0; i < bodyParts.length; i++) {
    const bodyPart = bodyParts[i];
    const bodyPartId = bodyPart.id;

    if (validBodyParts != null) {
      if (!validBodyParts.has(bodyPartId)) continue;
    }

    const items = bodyPart.items.sort((b, a) => b.z - a.z);

    for (let j = 0; j < items.length; j++) {
      const partDirection =
        bodyPartId === "head"
          ? normalizedDirection.direction
          : normalizedDirection.direction;
      const item = items[j];
      const partType = item.id;

      const checkFlipped = normalizedDirection.mirrorHorizontal;

      const partFrames = animationData.getAnimationFrames(
        actionData.id,
        partType
      );

      const getPartFrame = (frame: number) => {
        return frame % (partFrames !== null ? partFrames.length : 1);
      };

      const frameCount = animationData.getAnimationFramesCount(actionData.id);
      const parts = partByType.get(partType) ?? [];
      const getAssetPartDef = (frame: number) => {
        const assetPartDef =
          partFrames && partFrames[getPartFrame(frame)]
            ? partFrames[getPartFrame(frame)].assetpartdefinition
            : actionData.assetpartdefinition;

        return assetPartDef;
      };

      let partTypeFlipped: string | undefined;

      const partInfo = partSetsData.getPartInfo(partType);

      if (checkFlipped) {
        if (partInfo?.flippedSetType != null) {
          partTypeFlipped = partInfo.flippedSetType;
        }
      }

      if (partInfo?.removeSetType != null) {
        const removeSetType = partInfo.removeSetType;
      }

      const _getPartMeta = (
        assetPartDef: string,
        partId: string,
        frameNumber: number
      ) => {
        return getPartMeta({
          assetPartDef,
          direction: direction,
          normalizedDirection: normalizedDirection.direction,
          exists: (id: string) => offsetsData.getOffsets(id) != null,
          partFrame: frameNumber,
          partId: partId,
          partTypeFlipped: partTypeFlipped,
          partType: partType,
          mirrorHorizonal: normalizedDirection.mirrorHorizontal,
        });
      };

      if (item.id === "ri" && itemId != null) {
        const partMeta = _getPartMeta(getAssetPartDef(0), itemId.toString(), 0);
        const libraryId = figureMap.getLibraryOfPart(
          itemId.toString(),
          item.id
        );

        if (libraryId != null && partMeta != null) {
          const asset = getAssetFromPartMeta(libraryId, partMeta, offsetsData);

          if (asset != null) {
            map.set(item.id, [
              { color: undefined, mode: "just-image", assets: [asset] },
            ]);
          }
        }
      }

      for (const part of parts) {
        part.hiddenLayers.forEach((layer) => hiddenLayers.add(layer));

        const libraryId = figureMap.getLibraryOfPart(part.id, part.type);

        if (libraryId == null) {
          continue;
        }

        let normalizedPartFrames = partFrames;
        if (normalizedPartFrames.length === 0) {
          normalizedPartFrames = [
            { repeats: 2, assetpartdefinition: getAssetPartDef(0), number: 0 },
          ];
        }

        if (frame != null) {
          normalizedPartFrames = [
            {
              repeats: 2,
              assetpartdefinition: getAssetPartDef(frame),
              number: getPartFrame(frame),
            },
          ];
        }

        const frameElements: number[] = [];
        for (
          let frameIndex = 0;
          frameIndex < normalizedPartFrames.length;
          frameIndex++
        ) {
          const frame = normalizedPartFrames[frameIndex];

          for (
            let repeatIndex = 0;
            repeatIndex < frame.repeats;
            repeatIndex++
          ) {
            frameElements.push(frame.number);
          }
        }

        const frameAssetInfos = frameElements.map((frameNumber) => {
          return _getPartMeta(
            getAssetPartDef(frameNumber),
            part.id,
            frameNumber
          );
        });

        const currentPartsOnType = map.get(part.type) ?? [];

        const avatarAssets = frameAssetInfos
          .map((assetInfoFrame): AvatarAsset | undefined => {
            if (assetInfoFrame == null) return;

            return getAssetFromPartMeta(libraryId, assetInfoFrame, offsetsData);
          })
          .filter(notNullOrUndefined);

        if (avatarAssets.length > 0) {
          map.set(part.type, [
            ...currentPartsOnType,
            {
              assets: avatarAssets,
              color: part.colorable ? `#${part.color}` : undefined,
              mode:
                part.type !== "ey" && part.colorable ? "colored" : "just-image",
            },
          ]);
        }
      }
    }
  }

  return {
    parts: map,
    activePartSet: actionData?.activepartset,
    mirrorHorizontal: false,
    hiddenLayers,
  };
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

  offsetsX -= offsets.offsetX;
  offsetsY -= offsets.offsetY;
  if (assetInfoFrame.flipped) {
    offsetsX = 64 + offsets.offsetX;
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

function getOffsets(mirror: boolean) {
  return {
    offsetX: mirror ? 64 : 0,
    offsetY: 16,
  };
}

function getPartMeta({
  assetPartDef,
  partType,
  partTypeFlipped,
  partId,
  direction,
  partFrame,
  normalizedDirection,
  mirrorHorizonal,
  exists,
}: {
  assetPartDef: string;
  partType: string;
  partTypeFlipped?: string;
  partId: string;
  direction: number;
  partFrame: number;
  normalizedDirection: number;
  mirrorHorizonal: boolean;
  exists: (id: string) => boolean;
}) {
  const map = new Map<string, { flipped: boolean; swapped: boolean }>();
  const none = { flipped: false, swapped: false };
  const flipped = { flipped: true, swapped: false };
  const swapped = { flipped: false, swapped: true };
  const both = { flipped: true, swapped: true };
  const fallback = generateAssetName(
    "std",
    partType,
    partId,
    normalizedDirection,
    partFrame
  );

  if (partTypeFlipped != null) {
    map.set(
      generateAssetName(
        assetPartDef,
        partTypeFlipped,
        partId,
        direction,
        partFrame
      ),
      swapped
    );
    map.set(
      generateAssetName(assetPartDef, partTypeFlipped, partId, direction, 0),
      swapped
    );
    map.set(
      generateAssetName(
        assetPartDef,
        partTypeFlipped,
        partId,
        normalizedDirection,
        partFrame
      ),
      both
    );
    map.set(
      generateAssetName(
        assetPartDef,
        partTypeFlipped,
        partId,
        normalizedDirection,
        0
      ),
      both
    );
  }

  map.set(
    generateAssetName(assetPartDef, partType, partId, direction, partFrame),
    none
  );
  map.set(
    generateAssetName(assetPartDef, partType, partId, direction, 0),
    none
  );
  map.set(
    generateAssetName(
      assetPartDef,
      partType,
      partId,
      normalizedDirection,
      partFrame
    ),
    flipped
  );
  map.set(
    generateAssetName(assetPartDef, partType, partId, normalizedDirection, 0),
    flipped
  );

  const arr = Array.from(map);

  for (const [key, info] of arr) {
    const assetExists = exists(key);

    if (assetExists) return { asset: key, ...info };
  }
}

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
