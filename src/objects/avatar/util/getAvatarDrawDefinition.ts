import { ParsedLook } from "./parseLookString";
import { addMissingDrawOrderItems } from "./addMissingDrawOrderItems";
import { notNullOrUndefined } from "../../../util/notNullOrUndefined";
import { getDrawOrder } from "./drawOrder";
import {
  AvatarAnimationFrame,
  IAvatarAnimationData,
} from "./data/interfaces/IAvatarAnimationData";
import { IAvatarPartSetsData } from "./data/interfaces/IAvatarPartSetsData";
import { IAvatarOffsetsData } from "./data/interfaces/IAvatarOffsetsData";
import { IFigureMapData } from "./data/interfaces/IFigureMapData";
import { IFigureData } from "./data/interfaces/IFigureData";
import {
  Bodypart,
  IAvatarGeometryData,
} from "./data/interfaces/IAvatarGeometryData";
import { AvatarAction } from "../enum/AvatarAction";
import {
  AvatarActionInfo,
  IAvatarActionsData,
} from "./data/interfaces/IAvatarActionsData";
import { IAvatarEffectData } from "./data/interfaces/IAvatarEffectData";
import { DIRECTION_IS_FLIPPED, getFlippedMetaData } from "./getFlippedMetaData";
import { AvatarFigurePartType } from "../enum/AvatarFigurePartType";
import { getPartDataForParsedLook, PartData } from "./getPartDataForParsedLook";
import { getDrawOrderForActions } from "./getDrawOrderForActions";

const basePartSet = new Set<AvatarFigurePartType>([
  AvatarFigurePartType.LeftHand,
  AvatarFigurePartType.RightHand,
  AvatarFigurePartType.Body,
  AvatarFigurePartType.Head,
]);

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

  const { partSetsData, actionsData, figureData, geometry } = deps;

  // Sort actions by precedence. This basically determines in which order actions are applied.
  // For example, if a avatar is sitting and respecting, the sorting by precedence will return
  // the following order:
  // Default < Sit < Respect

  const activeActions = actionsData
    .getActions()
    .filter((info) => actions.has(info.id))
    .sort((a, b) => {
      if (a.precedence < b.precedence) return 1;
      if (a.precedence > b.precedence) return -1;

      return 0;
    });

  const partByType = getPartDataForParsedLook(parsedLook, figureData);

  // Here we determine the draworder based on the active actions.
  const drawOrderId = getDrawOrderForActions(activeActions, {
    hasItem: itemId != null,
  });

  const drawOrderRaw =
    getDrawOrder(drawOrderId, direction) ?? getDrawOrder("std", direction);

  // Since the draworder file has missing parts, we add them here.
  const drawOrderAdditional = addMissingDrawOrderItems(new Set(drawOrderRaw));

  const bodyParts = geometry
    .getBodyParts("full")
    .map((id) => geometry.getBodyPart("vertical", id))
    .filter(notNullOrUndefined)
    .sort((a, b) => b.z - a.z);

  const removeSetTypes = new Set<AvatarFigurePartType>();

  const drawPartMap = new Map<string, AvatarDrawPart[]>();

  activeActions.forEach((action) => {
    if (action.activepartset == null) return;

    const activePartSet = partSetsData.getActivePartSet(action.activepartset);

    bodyParts.forEach((bodyPart) => {
      // Select all parts of that bodypart who are in the activePartSet of that action.
      // This is there so an action only applies to the parts specified in the activePartSet.
      const parts = bodyPart.items
        .flatMap((item): PartData[] | PartData => {
          if (
            item.id === AvatarFigurePartType.RightHandItem &&
            itemId != null
          ) {
            return {
              type: AvatarFigurePartType.RightHandItem,
              color: undefined,
              colorable: false,
              hiddenLayers: [],
              id: itemId.toString(),
            };
          }

          const partsForType = partByType.get(item.id);
          if (partsForType == null) {
            if (basePartSet.has(item.id as AvatarFigurePartType)) {
              return [
                {
                  id: "1",
                  type: item.id,
                  color: undefined,
                  colorable: false,
                  hiddenLayers: [],
                },
              ];
            }

            return [];
          }

          return partsForType;
        })
        .map((part) => ({ ...part, bodypart: bodyPart }))
        .filter((item) => activePartSet.has(item.type));

      parts.forEach(({ hiddenLayers }) => {
        hiddenLayers.forEach((layer) =>
          removeSetTypes.add(layer as AvatarFigurePartType)
        );
      });

      // Get drawing parts for this body part
      const drawParts = getBodyPart(
        {
          actionData: action,
          direction,
          parts,
          itemId,
        },
        deps
      );

      const localDrawPartMap = new Map<string, AvatarDrawPart[]>();

      // Group body part draw parts by part type
      drawParts.resolvedParts.forEach((part) => {
        const existing = localDrawPartMap.get(part.type) ?? [];
        localDrawPartMap.set(part.type, [...existing, part]);
      });

      // For what is the `remove-set-type` in the partsets?

      // drawParts.removeSetTypes.forEach((partType) =>
      //   removeSetTypes.add(partType)
      // );

      // Override the result draw parts with the draw parts for this body part
      localDrawPartMap.forEach((parts, type) => drawPartMap.set(type, parts));
    });
  });

  // Get draw parts in the order specified by the draworder.
  const drawParts = drawOrderAdditional
    .filter((type) => !removeSetTypes.has(type as AvatarFigurePartType))
    .flatMap((partType) => drawPartMap.get(partType))
    .filter(notNullOrUndefined);

  return {
    parts: drawParts,
    offsetX: 0,
    offsetY: 0,
  };
}

function getBodyPart(
  {
    actionData,
    direction,
    parts,
  }: {
    parts: PartDataWithBodyPart[];
    actionData: AvatarActionInfo;
    direction: number;
    itemId?: string | number;
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
  resolvedParts: AvatarDrawPart[];
  removeSetTypes: Set<AvatarFigurePartType>;
} {
  if (actionData == null) throw new Error("Invalid action data");

  let remainingPartCount = parts.length - 1;
  let assetPartDefinition = actionData.assetpartdefinition;

  const resolvedParts: AvatarDrawPart[] = [];
  const removeSetTypes = new Set<AvatarFigurePartType>();

  while (remainingPartCount >= 0) {
    const part = parts[remainingPartCount];

    const frames = animationData.getAnimationFrames(actionData.id, part.type);

    let framesIndexed: (
      | AvatarAnimationFrame
      | undefined
    )[] = frames.flatMap((frame) => new Array(frame.repeats).fill(frame));

    if (framesIndexed.length === 0) {
      framesIndexed = [undefined];
    }

    const partInfo = partSetsData.getPartInfo(part.type);

    if (partInfo?.removeSetType != null) {
      removeSetTypes.add(partInfo.removeSetType as AvatarFigurePartType);
    }

    const assets = framesIndexed.map((animationFrame) =>
      getAssetForFrame({
        offsetsData,
        direction,
        partTypeFlipped: partInfo?.flippedSetType as
          | AvatarFigurePartType
          | undefined,
        actionData: actionData,
        animationFrame,
        figureMap,
        partId: part.id,
        partType: part.type as AvatarFigurePartType,
      })
    );

    const assetsFiltered = assets.filter(notNullOrUndefined);

    if (assetsFiltered.length > 0) {
      resolvedParts.push({
        assets: assetsFiltered,
        color: part.colorable ? `#${part.color}` : undefined,
        mode: part.type !== "ey" && part.colorable ? "colored" : "just-image",
        type: part.type,
      });
    }

    remainingPartCount--;
  }

  return {
    resolvedParts,
    removeSetTypes,
  };
}

function getAssetForFrame({
  animationFrame,
  actionData,
  partTypeFlipped,
  direction,
  partType,
  partId,
  offsetsData,
  figureMap,
}: {
  animationFrame?: AvatarAnimationFrame;
  actionData: AvatarActionInfo;
  partTypeFlipped?: AvatarFigurePartType;
  partType: AvatarFigurePartType;
  direction: number;
  partId: string;
  offsetsData: IAvatarOffsetsData;
  figureMap: IFigureMapData;
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
    direction,
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

    let libraryId = figureMap.getLibraryOfPart(partId, flippedMeta.partType);
    if (libraryId == null) {
      libraryId = getLibraryForPartType(flippedMeta.partType);
    }

    if (libraryId != null) {
      const asset = getAssetFromPartMeta(
        assetPartDefinition,
        libraryId,
        { flipped: flipH, swapped: false, asset: assetId },
        offsetsData
      );

      if (asset != null) {
        return asset;
      } else {
      }
    } else {
    }
  } else {
  }
}

function getLibraryForPartType(partType: AvatarFigurePartType) {
  switch (partType) {
    case AvatarFigurePartType.LeftSleeve:
    case AvatarFigurePartType.RightSleeve:
      return "hh_human_shirt";
  }
}

function getAssetFromPartMeta(
  assetPartDefinition: string,
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

  if (assetPartDefinition === "lay") {
    if (assetInfoFrame.flipped) {
      offsetsX -= 52;
    } else {
      offsetsX += 52;
    }
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

export interface PartDataWithBodyPart extends PartData {
  bodypart: Bodypart;
}
