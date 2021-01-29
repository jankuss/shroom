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
import { associateBy } from "../../../util/associateBy";
import { getAssetFromPartMeta } from "./getAssetFromPartMeta";
import { getBodyPartParts } from "./getBodyPartParts";
import { getAvatarDirection } from "./getAvatarDirection";
import { EffectDrawDefinition } from "../effects/EffectDrawDefinition";
import { AvatarDrawDefinitionStructure } from "../structure/AvatarDrawDefinition";

export const basePartSet = new Set<AvatarFigurePartType>([
  AvatarFigurePartType.LeftHand,
  AvatarFigurePartType.RightHand,
  AvatarFigurePartType.Body,
  AvatarFigurePartType.Head,
]);

const headComponents: Set<AvatarFigurePartType> = new Set([
  AvatarFigurePartType.Head,
  AvatarFigurePartType.Face,
  AvatarFigurePartType.Eyes,
  AvatarFigurePartType.EyeAccessory,
  AvatarFigurePartType.Hair,
  AvatarFigurePartType.HairBig,
  AvatarFigurePartType.FaceAccessory,
  AvatarFigurePartType.HeadAccessory,
  AvatarFigurePartType.HeadAccessoryExtra,
]);

/**
 * Returns a definition of how the avatar should be drawn.
 * @param options Look options
 * @param deps External figure data, draw order and offsets
 */
export function getAvatarDrawDefinition(
  {
    parsedLook,
    actions: initialActions,
    direction,
    headDirection,
    item: itemId,
    effect,
  }: Options,
  deps: AvatarDependencies
): AvatarDrawDefinition | undefined {
  const actions = new Set(initialActions).add(AvatarAction.Default);
  const {
    partSetsData,
    actionsData,
    figureData,
    geometry,
    animationData,
    figureMap,
    offsetsData,
  } = deps;

  const def = new AvatarDrawDefinitionStructure(
    {
      actions,
      direction,
      frame: 0,
      look: parsedLook,
      item: itemId,
      headDirection,
      effect,
    },
    deps
  );

  return {
    parts: def.getDrawDefinition(),
    offsetX: 0,
    offsetY: 0,
  };

  // Sort actions by precedence. This basically determines in which order actions are applied.
  // For example, if a avatar is sitting and respecting, the sorting by precedence will returfn
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

  const bodyParts = geometry
    .getBodyParts("full")
    .map((id) => geometry.getBodyPart("vertical", id))
    .filter(notNullOrUndefined)
    .sort((a, b) => b.z - a.z);

  const bodyPartById = associateBy(bodyParts, (part) => part.id);

  const removeSetTypes = new Set<AvatarFigurePartType>();
  const drawPartMap = new Map<string, DefaultAvatarDrawPart[]>();

  const effectDrawDefintion =
    effect &&
    new EffectDrawDefinition(
      effect,
      { bodyPartById, direction, partByType },
      deps
    );

  const displayDirection = getAvatarDirection(
    direction,
    effectDrawDefintion?.getDirectionOffset()
  );

  const drawOrderRaw =
    getDrawOrder(drawOrderId, displayDirection) ??
    getDrawOrder("std", displayDirection);

  // Since the draworder file has missing parts, we add them here.
  const drawOrderAdditional = addMissingDrawOrderItems(new Set(drawOrderRaw));

  activeActions.forEach((action) => {
    if (action.activepartset == null) return;

    const activePartSet = partSetsData.getActivePartSet(action.activepartset);

    bodyParts.forEach((bodyPart) => {
      // Select all parts of that bodypart who are in the activePartSet of that action.
      // This is there so an action only applies to the parts specified in the activePartSet.

      const parts = getBodyPartParts(bodyPart, {
        itemId,
        partByType,
      }).filter((item) => activePartSet.has(item.type));

      parts.forEach(({ hiddenLayers }) => {
        hiddenLayers.forEach((layer) =>
          removeSetTypes.add(layer as AvatarFigurePartType)
        );
      });

      // Get drawing parts for this body part
      const drawParts = getBodyPart(
        {
          actionData: action,
          direction: displayDirection,
          headDirection: headDirection != null ? headDirection : undefined,
          parts,
          itemId,
        },
        deps
      );

      const localDrawPartMap = new Map<string, DefaultAvatarDrawPart[]>();

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

  let additionalParts: AvatarEffectDrawPart[] = [];

  if (effectDrawDefintion != null) {
    effectDrawDefintion.getAvatarBodyDrawParts().forEach((parts, key) => {
      drawPartMap.set(key, parts);
    });

    additionalParts = effectDrawDefintion.getAdditionalDrawParts();
  }

  // Get draw parts in the order specified by the draworder.
  let drawParts: AvatarDrawPart[] = drawOrderAdditional
    .filter((type) => !removeSetTypes.has(type as AvatarFigurePartType))
    .flatMap((partType) => drawPartMap.get(partType))
    .filter(notNullOrUndefined)
    .map((part, index) => ({ ...part, z: index * 0.001 }));

  const additionalPartsDefault = additionalParts.filter(
    (part) => !part.addition
  );
  const additionalPartAdditions = additionalParts.filter(
    (part) => part.addition
  );

  if (effectDrawDefintion != null) {
    drawParts = effectDrawDefintion.applyAvatarOffsets([
      ...drawParts,
      ...additionalPartAdditions,
    ]);
  }

  additionalPartsDefault.forEach((ap) => {
    drawParts.push(ap);
  });

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
    headDirection,
    parts,
  }: {
    parts: PartDataWithBodyPart[];
    actionData: AvatarActionInfo;
    direction: number;
    headDirection?: number;
    itemId?: string | number;
  },
  {
    offsetsData,
    animationData,
    partSetsData,
    figureMap,
    figureData,
  }: AvatarDependencies
): {
  resolvedParts: DefaultAvatarDrawPart[];
  removeSetTypes: Set<AvatarFigurePartType>;
} {
  if (actionData == null) throw new Error("Invalid action data");

  let remainingPartCount = parts.length - 1;

  const resolvedParts: DefaultAvatarDrawPart[] = [];
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
        direction:
          headComponents.has(part.type as AvatarFigurePartType) &&
          headDirection != null
            ? headDirection
            : direction,
        partTypeFlipped: partInfo?.flippedSetType as
          | AvatarFigurePartType
          | undefined,
        actionData: actionData,
        animationFrame,
        figureMap,
        partId: part.id,
        partType: part.type as AvatarFigurePartType,
        setId: part.setId,
        setType: part.setType,
        figureData,
      })
    );

    const assetsFiltered = assets.filter(notNullOrUndefined);

    if (assetsFiltered.length > 0) {
      resolvedParts.push({
        kind: "AVATAR_DRAW_PART",
        assets: assetsFiltered,
        color: part.colorable ? `#${part.color}` : undefined,
        mode: part.type !== "ey" && part.colorable ? "colored" : "just-image",
        type: part.type,
        index: part.index,
        z: 0,
      });
    }

    resolvedParts.sort((a, b) => a.index - b.index);

    remainingPartCount--;
  }

  return {
    resolvedParts,
    removeSetTypes,
  };
}

export function getAssetForFrame({
  animationFrame,
  actionData,
  partTypeFlipped,
  direction,
  partType,
  partId,
  offsetsData,
  figureMap,
  figureData,
  setId,
  setType,
  offsetX = 0,
  offsetY = 0,
}: {
  animationFrame?: AvatarAnimationFrame;
  actionData: AvatarActionInfo;
  partTypeFlipped?: AvatarFigurePartType;
  partType: AvatarFigurePartType;
  direction: number;
  partId: string;
  setId?: string;
  setType?: string;
  offsetsData: IAvatarOffsetsData;
  figureMap: IFigureMapData;
  figureData: IFigureData;
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

export type AvatarAsset = {
  fileId: string;
  x: number;
  y: number;
  library: string;
  mirror: boolean;
};

export type AvatarDrawPart = DefaultAvatarDrawPart | AvatarEffectDrawPart;

export type DefaultAvatarDrawPart = {
  kind: "AVATAR_DRAW_PART";
  type: string;
  index: number;
  mode: "colored" | "just-image";
  color: string | undefined;
  assets: AvatarAsset[];
  z: number;
};

export type AvatarEffectDrawPart = {
  kind: "EFFECT_DRAW_PART";
  assets: AvatarAsset[];
  z: number;
  ink?: number;
  addition: boolean;
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
  headDirection?: number;
  frame: number;
  item?: string | number;
  effect?: IAvatarEffectData;
}

export interface PartDataWithBodyPart extends PartData {
  bodypart: Bodypart;
}
