import { AvatarAction } from "../enum/AvatarAction";
import { AvatarFigurePartType } from "../enum/AvatarFigurePartType";
import {
  AvatarEffectSprite,
  AvatarEffectSpriteDirection,
  IAvatarEffectData,
} from "../util/data/interfaces/IAvatarEffectData";
import { Bodypart } from "../util/data/interfaces/IAvatarGeometryData";
import { IAvatarOffsetsData } from "../util/data/interfaces/IAvatarOffsetsData";
import { applyOffsets } from "../util/getAssetFromPartMeta";
import {
  AvatarAsset,
  AvatarDependencies,
  AvatarDrawPart,
  AvatarEffectDrawPart,
  DefaultAvatarDrawPart,
  getAssetForFrame,
} from "../util/getAvatarDrawDefinition";
import { getBodyPartParts } from "../util/getBodyPartParts";
import { getBasicFlippedMetaData } from "../util/getFlippedMetaData";
import { PartData } from "../util/getPartDataForParsedLook";

export class EffectDrawDefinition {
  private _parts: Map<string, DefaultAvatarDrawPart[]> = new Map();
  private _additionalParts: AvatarEffectDrawPart[] = [];

  constructor(
    private effect: IAvatarEffectData,
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

    const directionOffset = effect.getDirection()?.offset ?? 0;
    const effectParts = new Map<string, EffectFXSprite>();
    const effectDrawParts = new Map<string, AvatarEffectDrawPart>();

    effect.getSprites().forEach((sprite, index) => {
      let displayDirection = 0;
      if (sprite.directions) {
        displayDirection = direction;
      }

      const flippedMeta = getBasicFlippedMetaData(displayDirection);
      displayDirection = flippedMeta.direction;

      if (sprite.member != null) {
        const directionInfo = effect.getSpriteDirection(sprite.id, direction);
        const part = new EffectFXSprite(
          sprite,
          offsetsData,
          directionInfo?.dz ?? 0,
          false
        );

        effectParts.set(sprite.id, part);
      }
    });

    effect.getAddtions().forEach((addition) => {
      let displayDirection = direction;

      const flippedMeta = getBasicFlippedMetaData(displayDirection);
      displayDirection = flippedMeta.direction;

      const spriteMember = `std_${addition.id}_1`;

      if (spriteMember != null) {
        const part = new EffectFXSprite(
          { directions: true, member: spriteMember, id: addition.id },
          offsetsData,
          addition.align === "top" ? 1 : -1,
          true
        );

        effectParts.set(addition.id, part);
      }
    });

    for (let i = 0; i < frameCount; i++) {
      const effectFrameBodypartInfo = effect.getFrameBodyParts(i);
      const effectFrameFxInfo = effect.getFrameEffectParts(i);

      for (const effectBodyPart of effectFrameBodypartInfo) {
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
            direction: direction + directionOffset,
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
              z: 0,
            };

            assets.set(part.type, currentPartArr);
          }
        }
      }

      for (const fxPart of effectFrameFxInfo) {
        const effectPart = effectParts.get(fxPart.id);
        const frameEffectPart = effectPart?.getFrame(
          direction,
          fxPart.frame ?? 0
        );
        const directionInfo = effect.getSpriteDirection(fxPart.id, direction);

        const drawPart = effectDrawParts.get(fxPart.id);

        if (frameEffectPart != null) {
          const asset: AvatarAsset = {
            ...frameEffectPart,
            x: frameEffectPart.x + (fxPart.dx ?? 0),
            y: frameEffectPart.y + (fxPart.dy ?? 0),
          };

          if (drawPart != null) {
            effectDrawParts.set(fxPart.id, {
              ...drawPart,
              z: effectPart?.getZ() ?? 0,
              assets: [...drawPart.assets, asset, asset],
              addition: effectPart?.isAddition() ?? false,
            });
          } else {
            effectDrawParts.set(fxPart.id, {
              kind: "EFFECT_DRAW_PART",
              z: effectPart?.getZ() ?? 0,
              ink: effectPart?.getSprite().ink,
              assets: [asset, asset],
              addition: effectPart?.isAddition() ?? false,
            });
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

    effect.getSprites().forEach((sprite) => {
      const part = effectParts.get(sprite.id);
      if (part == null) return;

      const drawPart = part.getFrame(direction, 0);

      if (drawPart != null && !effectDrawParts.has(sprite.id)) {
        effectDrawParts.set(sprite.id, {
          assets: [drawPart],
          kind: "EFFECT_DRAW_PART",
          z: part.getZ(),
          ink: sprite.ink,
          addition: false,
        });
      }
    });

    effectDrawParts.forEach((value) => additionalParts.push(value));

    this._additionalParts = additionalParts;
    this._parts = drawPartMap;
  }

  getAvatarBodyDrawParts() {
    return this._parts;
  }

  getAdditionalDrawParts() {
    return this._additionalParts;
  }

  getDirectionOffset() {
    return this.effect.getDirection()?.offset;
  }

  applyAvatarOffsets(parts: AvatarDrawPart[]): AvatarDrawPart[] {
    if (
      this.effect.getSprites().find((sprite) => sprite.id === "avatar") == null
    ) {
      return parts;
    }

    return parts.map((part) => {
      const baseAsset = part.assets[0];
      if (baseAsset == null) return part;

      const assets: AvatarAsset[] = [];

      for (let i = 0; i < this.effect.getFrameCount(); i++) {
        const frame = this.effect
          .getFrameEffectParts(i)
          .find((fxPart) => fxPart.id === "avatar");

        if (frame != null) {
          assets.push({
            ...baseAsset,
            x: baseAsset.x + (frame?.dx ?? 0),
            y: baseAsset.y + (frame?.dy ?? 0),
          });

          assets.push({
            ...baseAsset,
            x: baseAsset.x + (frame?.dx ?? 0),
            y: baseAsset.y + (frame?.dy ?? 0),
          });
        }
      }

      return {
        ...part,
        assets: assets,
      };
    });
  }
}

class EffectFXSprite {
  constructor(
    private _sprite: AvatarEffectSprite,
    private _offsets: IAvatarOffsetsData,
    private _z: number,
    private _addition: boolean
  ) {}

  isAddition() {
    return this._addition;
  }

  getZ() {
    return this._z;
  }

  getSprite() {
    return this._sprite;
  }

  getFrame(direction: number, frame: number): AvatarAsset | undefined {
    let displayDirection = 0;
    if (this._sprite.directions) {
      displayDirection = direction;
    }

    const flippedMeta = getBasicFlippedMetaData(displayDirection);
    displayDirection = flippedMeta.direction;

    if (this._sprite.member != null) {
      const id = getSpriteId(this._sprite.member, displayDirection, frame);

      const offsets = this._offsets.getOffsets(id);

      if (offsets == null) return;

      const { x, y } = applyOffsets({
        offsets,
        customOffsets: { offsetX: 0, offsetY: 0 },
        lay: false,
        flipped: flippedMeta.flipped,
      });

      return {
        fileId: id,
        library: "",
        mirror: flippedMeta.flipped,
        x,
        y,
      };
    }
  }
}

const getSpriteId = (member: string, direction: number, frame: number) =>
  `h_${member}_${direction}_${frame}`;
