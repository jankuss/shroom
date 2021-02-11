import { AvatarAction } from "../enum/AvatarAction";
import {
  AvatarActionInfo,
  IAvatarActionsData,
} from "../data/interfaces/IAvatarActionsData";
import {
  AvatarEffectFrameFXPart,
  AvatarEffectSprite,
  AvatarEffectSpriteDirection,
  IAvatarEffectData,
} from "../data/interfaces/IAvatarEffectData";
import { IAvatarOffsetsData } from "../data/interfaces/IAvatarOffsetsData";
import { applyOffsets } from "../util/getAssetFromPartMeta";
import { getAvatarDirection } from "../util/getAvatarDirection";
import { IAvatarEffectPart } from "./interface/IAvatarEffectPart";
import { getEffectSprite } from "../util/getEffectSprite";
import { AvatarAsset, AvatarEffectDrawPart } from "../types";

export class AvatarEffectPart implements IAvatarEffectPart {
  private _direction: number | undefined;
  private _directionOffset = 0;
  private _offsets: Map<number, AvatarEffectFrameFXPart> = new Map();

  private _customFrames: CustomPartFrame[] = [];

  constructor(
    private _sprite: AvatarEffectSprite,
    private _actionsData: IAvatarActionsData,
    private _offsetsData: IAvatarOffsetsData,
    private _effectData: IAvatarEffectData
  ) {}

  setDirection(direction: number) {
    this._direction = direction;
  }

  setDirectionOffset(offset: number) {
    this._directionOffset = offset;
  }

  getDirection(offset = 0) {
    if (this._direction == null) return;

    if (!this._sprite.directions) {
      return 0;
    }

    return getAvatarDirection(this._direction + this._directionOffset + offset);
  }

  setEffectFrame(effect: IAvatarEffectData, frame: number) {
    const part = effect.getFrameEffectPart(this._sprite.id, frame);

    if (part != null) {
      let actionData =
        part.action != null
          ? this._actionsData.getAction(part.action as AvatarAction)
          : undefined;

      if (actionData == null) {
        actionData = this._actionsData.getAction(AvatarAction.Default);
      }

      this._customFrames.push({
        action: actionData,
        frame: part.frame,
        dd: part.dd,
        dx: part.dx,
        dy: part.dy,
      });
    }
  }

  setAvatarOffsets(avatarFrame: AvatarEffectFrameFXPart, frame: number) {
    this._offsets.set(frame, avatarFrame);
  }

  setEffectFrameDefaultIfNotSet() {
    if (this._customFrames.length > 0) return;

    const action = this._actionsData.getAction(AvatarAction.Default);

    this._customFrames.push({
      action,
    });
  }

  getDrawDefinition(): AvatarEffectDrawPart | undefined {
    const assets: AvatarAsset[] = [];

    const directionData =
      this._direction != null
        ? this._effectData.getSpriteDirection(this._sprite.id, this._direction)
        : undefined;

    this._customFrames.forEach((customFrame) => {
      const action = customFrame.action;
      if (action == null) throw new Error("Invalid action");

      const direction = this.getDirection(customFrame.dd);
      if (direction == null) return;

      const asset = this._getAvatarAsset(
        direction,
        customFrame.frame ?? 0,
        customFrame,
        directionData
      );

      if (asset != null) {
        assets.push(asset);
      }
    });

    if (assets.length === 0) return;

    return {
      assets: assets.flatMap((asset) => [asset, asset]),
      addition: false,
      kind: "EFFECT_DRAW_PART",
      z: directionData?.dz ?? 0,
      ink: this._sprite.ink,
    };
  }

  private _getAvatarAsset(
    direction: number,
    frame: number,
    customFrame: CustomPartFrame,
    directionData?: AvatarEffectSpriteDirection
  ) {
    if (this._sprite.member != null) {
      const { id, offsets, flip } = getEffectSprite(
        this._sprite.member,
        direction,
        frame,
        this._offsetsData,
        this._sprite.directions,
        false
      );

      if (offsets == null) {
        return;
      }

      const { x, y } = applyOffsets({
        offsets,
        customOffsets: {
          offsetX: customFrame.dx ?? 0 - (directionData?.dx ?? 0),
          offsetY: customFrame.dy ?? 0 + (directionData?.dy ?? 0),
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
}

export const getSpriteId = (member: string, direction: number, frame: number) =>
  `h_${member}_${direction}_${frame}`;

interface CustomPartFrame {
  frame?: number;
  action?: AvatarActionInfo;
  dx?: number;
  dy?: number;
  dd?: number;
}
