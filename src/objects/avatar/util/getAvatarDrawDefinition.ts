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
import {
  AvatarAnimationFrame,
  IAvatarAnimationData,
} from "./data/IAvatarAnimationData";
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

  //let drawPartMap = new Map<string, AvatarDrawPart[]>();
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

  const drawPartMap = new Map<string, AvatarDrawPart[]>();

  activeActions.forEach((action) => {
    const localDrawPartMap = new Map<string, AvatarDrawPart[]>();
    if (action.activepartset == null) return;

    const activePartSet = partSetsData.getActivePartSet(action.activepartset);

    bodyParts.forEach((bodyPart) => {
      const parts = bodyPart.items
        .flatMap((item) => {
          const partsForType = partByType.get(item.id);
          if (partsForType == null) return [];

          return partsForType;
        })
        .map((part) => ({ ...part, bodypart: bodyPart }))
        .filter((item) => activePartSet.has(item.type));

      const drawParts = getBodyPart(
        {
          actionData: action,
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

      localDrawPartMap.forEach((parts, type) => drawPartMap.set(type, parts));
    });
  });

  const drawParts = drawOrderAdditional
    .flatMap((partType) => drawPartMap.get(partType))
    .filter(notNullOrUndefined);

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
    parts,
    bodyPartId,
  }: {
    parts: PartDataWithBodyPart[];
    bodyPartId: string;
    actionData: AvatarActionInfo;
    direction: number;
    itemId?: string | number;
    validBodyParts?: Set<string>;
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

  const resolvedParts: AvatarDrawPart[] = [];

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

  return resolvedParts;
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

    const libraryId = figureMap.getLibraryOfPart(partId, flippedMeta.partType);

    if (libraryId != null) {
      const asset = getAssetFromPartMeta(
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
