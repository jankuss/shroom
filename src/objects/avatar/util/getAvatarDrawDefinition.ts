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
import { AvatarAction } from "./AvatarAction";
import {
  AvatarActionInfo,
  IAvatarActionsData,
} from "./data/IAvatarActionsData";
import { debug } from "console";

export type AvatarDrawPart = {
  fileId: string;
  library: string;
  x: number;
  y: number;
  color: string | undefined;
  mirror: boolean;
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
}

/**
 * Returns a definition of how the avatar should be drawn.
 * @param options Look options
 * @param dependencies External figure data, draw order and offsets
 */
export function getAvatarDrawDefinition(
  { parsedLook, actions, direction }: Options,
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
  const activeActions = actionsData
    .getActions()
    .filter((info) => actions.has(info.id))
    .sort((a, b) => {
      if (a.precedence < b.precedence) return 1;
      if (a.precedence > b.precedence) return -1;

      return 0;
    });

  const partByType = new Map<
    string,
    {
      color: string | undefined;
      id: string;
      type: string;
      colorable: boolean;
      hiddenLayers: string[];
    }[]
  >();

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

  const drawPartMap = new Map<string, AvatarDrawPart[]>();
  const activePartSets = new Set<string>();

  activeActions.forEach((info) => {
    const drawParts = getActionParts(
      { partByType, direction, actionData: info },
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

  const frame = 0;

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

    const items = bodyPart.items.sort((b, a) => b.z - a.z);

    for (let j = 0; j < items.length; j++) {
      const partDirection =
        bodyPartId === "head"
          ? normalizedDirection.direction
          : normalizedDirection.direction;
      const item = items[j];
      const partType = item.id;

      const checkFlipped = normalizedDirection.mirrorHorizontal;

      const actionValidParts = partSetsData.getActivePartSet(
        actionData.activepartset ?? "figure"
      );
      const partFrames = animationData.getAnimationFrames(
        actionData.id,
        partType
      );

      const parts = partByType.get(partType) ?? [];

      for (const part of parts) {
        const partFrame = frame % (partFrames !== null ? partFrames.length : 1);
        let assetPartDef =
          partFrames && partFrames[partFrame]
            ? partFrames[partFrame].assetpartdefinition
            : actionData.assetpartdefinition;

        part.hiddenLayers.forEach((layer) => hiddenLayers.add(layer));

        if (!actionValidParts.has(part.type)) {
          continue;
        }

        const libraryId = figureMap.getLibraryOfPart(part.id, part.type);

        if (libraryId == null) {
          continue;
        }

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

        const assetInfo = getPartMeta({
          assetPartDef,
          direction: direction,
          normalizedDirection: normalizedDirection.direction,
          exists: (id) => offsetsData.getOffsets(id) != null,
          partFrame: 0,
          partId: part.id,
          partType: part.type,
          partTypeFlipped: partTypeFlipped,
          mirrorHorizonal: normalizedDirection.mirrorHorizontal,
        });

        if (assetInfo == null) continue;

        const offsets = offsetsData.getOffsets(assetInfo.asset);
        if (offsets == null) continue;

        let offsetsX = 0;
        let offsetsY = 0;
        let mirror = false;

        if (assetInfo.swapped) {
          offsetsX -= offsets.offsetX;
          offsetsY -= offsets.offsetY;
        } else {
          offsetsX -= offsets.offsetX;
          offsetsY -= offsets.offsetY;
        }

        if (assetInfo.flipped) {
          offsetsX = 64 + offsets.offsetX;
        }

        const currentPartsOnType = map.get(part.type) ?? [];
        map.set(part.type, [
          ...currentPartsOnType,
          {
            fileId: assetInfo.asset,
            library: libraryId,
            color: part.colorable ? `#${part.color}` : undefined,
            mirror: assetInfo.flipped,
            mode:
              part.type !== "ey" && part.colorable ? "colored" : "just-image",
            x: offsetsX,
            y: offsetsY + 16,
          },
        ]);
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
  const flipped = { flipped: mirrorHorizonal, swapped: false };
  const swapped = { flipped: false, swapped: true };
  const both = { flipped: mirrorHorizonal, swapped: true };
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
