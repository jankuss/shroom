import { AvatarAction } from "../enum/AvatarAction";
import { AvatarFigurePartType } from "../enum/AvatarFigurePartType";
import { IAvatarActionsData } from "../data/interfaces/IAvatarActionsData";
import {
  AvatarEffectFrameBodypart,
  AvatarEffectFrameFXPart,
  AvatarEffectFXAddition,
  IAvatarEffectData,
} from "../data/interfaces/IAvatarEffectData";
import { IAvatarOffsetsData } from "../data/interfaces/IAvatarOffsetsData";
import { IAvatarPartSetsData } from "../data/interfaces/IAvatarPartSetsData";
import { applyOffsets } from "../util/getAssetFromPartMeta";
import { getAvatarDirection } from "../util/getAvatarDirection";
import { CustomPartFrame } from "./AvatarPart";
import { IAvatarDrawablePart } from "./interface/IAvatarDrawablePart";
import { getEffectSprite } from "../util/getEffectSprite";
import { AvatarAsset, AvatarDrawPart } from "../types";

export class AvatarAdditionPart implements IAvatarDrawablePart {
  private _direction: number | undefined;
  private _directionOffset = 0;
  private _mode: "fx" | "bodypart" | undefined;
  private _customFrames: AdditionCustomFramePart[] = [];
  private _offsets: Map<number, AvatarEffectFrameFXPart> = new Map();

  constructor(
    private _addition: AvatarEffectFXAddition,
    private _actionsData: IAvatarActionsData,
    private _offsetsData: IAvatarOffsetsData,
    private _partSetsData: IAvatarPartSetsData
  ) {}

  getDirection(offset = 0) {
    if (this._direction == null) return;

    return getAvatarDirection(this._direction + this._directionOffset + offset);
  }

  getDrawDefinition(): AvatarDrawPart | undefined {
    const assets: AvatarAsset[] = [];

    this._customFrames.forEach((customFrame, index) => {
      const action = customFrame.action;
      if (action == null) throw new Error("Invalid action");

      const direction = this.getDirection(customFrame.dd);
      if (direction == null) return;

      const asset = this._getAsset(
        direction,
        customFrame.frame,
        index,
        customFrame
      );

      if (asset != null) {
        assets.push(asset);
      }
    });

    if (assets.length === 0) return;

    return {
      kind: "EFFECT_DRAW_PART",
      addition: false,
      assets: assets.flatMap((asset) => [asset, asset]),
      z: 0,
    };
  }

  setEffectFrame(effect: IAvatarEffectData, frame: number): void {
    const bodyPart =
      this._addition.base != null
        ? effect.getFrameBodyPartByBase(this._addition.base, frame)
        : undefined;

    const fx = effect.getFrameEffectPart(this._addition.id, frame);

    if (bodyPart != null) {
      this._handleBodyPart(effect, frame, bodyPart);
    } else if (fx != null) {
      this._handleFxPart(effect, frame, fx);
    }
  }

  setDirection(direction: number): void {
    this._direction = direction;
  }

  setDirectionOffset(offset: number): void {
    this._directionOffset = offset;
  }

  setAvatarOffsets(avatarFrame: AvatarEffectFrameFXPart, frame: number) {
    this._offsets.set(frame, avatarFrame);
  }

  private _getAsset(
    direction: number,
    frame: number,
    frameIndex: number,
    customFrame: AdditionCustomFramePart
  ) {
    const partType = this._addition.id as AvatarFigurePartType;
    const partInfo = this._partSetsData.getPartInfo(partType);

    const base = customFrame.base ?? this._addition.base;
    const member =
      base != null
        ? `${customFrame.action.assetpartdefinition}_${this._addition.id}_${base}`
        : `${customFrame.action.assetpartdefinition}_${this._addition.id}_1`;

    if (member != null) {
      const { id, offsets, flip } = getEffectSprite(
        member,
        direction,
        frame,
        this._offsetsData,
        true,
        this._mode === "fx"
      );

      if (offsets == null) {
        return;
      }

      const avatarOffsets = this._offsets.get(frameIndex);

      const { x, y } = applyOffsets({
        offsets: {
          offsetX: offsets.offsetX,
          offsetY: offsets.offsetY,
        },
        customOffsets: {
          offsetX: (customFrame.dx ?? 0) + (avatarOffsets?.dx ?? 0),
          offsetY: (customFrame.dy ?? 0) + (avatarOffsets?.dy ?? 0),
        },
        lay: false,
        flipped: flip,
      });

      return {
        fileId: id,
        library: "",
        mirror: flip,
        x,
        y,
      };
    }
  }

  private _setMode(mode: "fx" | "bodypart") {
    if (this._mode != null && this._mode !== mode) {
      throw new Error("Can't change mode once it is set.");
    }

    this._mode = mode;
  }

  private _handleBodyPart(
    effect: IAvatarEffectData,
    frame: number,
    bodyPart: AvatarEffectFrameBodypart
  ) {
    this._setMode("bodypart");

    const action = this._actionsData.getAction(bodyPart.action as AvatarAction);
    if (action == null) throw new Error("Invalid action " + bodyPart.action);

    this._customFrames.push({
      action,
      frame: bodyPart.frame ?? 0,
      dd: bodyPart.dd,
      dx: bodyPart.dx,
      dy: bodyPart.dy,
    });
  }

  private _handleFxPart(
    effect: IAvatarEffectData,
    frame: number,
    fx: AvatarEffectFrameFXPart
  ) {
    this._setMode("fx");

    const action = this._actionsData.getAction(fx.action as AvatarAction);
    if (action == null) throw new Error("Invalid action " + fx.action);

    this._customFrames.push({
      action,
      frame: fx.frame ?? 0,
      dd: fx.dd,
      dx: fx.dx,
      dy: fx.dy,
    });
  }
}

export interface AdditionCustomFramePart extends CustomPartFrame {
  base?: string;
}
