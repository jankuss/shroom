import { AvatarAction } from "../enum/AvatarAction";
import {
  AvatarActionInfo,
  IAvatarActionsData,
} from "../util/data/interfaces/IAvatarActionsData";
import {
  AvatarEffectSprite,
  IAvatarEffectData,
} from "../util/data/interfaces/IAvatarEffectData";
import { IAvatarOffsetsData } from "../util/data/interfaces/IAvatarOffsetsData";
import { applyOffsets } from "../util/getAssetFromPartMeta";
import {
  AvatarAsset,
  AvatarEffectDrawPart,
} from "../util/getAvatarDrawDefinition";
import { getBasicFlippedMetaData } from "../util/getFlippedMetaData";

export class AvatarEffectPart {
  private _direction: number | undefined;
  private _customFrames: CustomPartFrame[] = [];

  constructor(
    private _sprite: AvatarEffectSprite,
    private _actionsData: IAvatarActionsData,
    private _offsetsData: IAvatarOffsetsData
  ) {}

  setDirection(direction: number) {
    this._direction = direction;
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

  setEffectFrameDefaultIfNotSet() {
    if (this._customFrames.length > 0) return;

    const action = this._actionsData.getAction(AvatarAction.Default);

    this._customFrames.push({
      action,
    });
  }

  getDrawDefinition(): AvatarEffectDrawPart | undefined {
    const assets: AvatarAsset[] = [];

    this._customFrames.forEach((customFrame) => {
      const action = customFrame.action;
      if (this._direction == null) return;
      if (action == null) throw new Error("Invalid action");

      const direction = this._direction + (customFrame.dd ?? 0);
      const asset = this._getAvatarAsset(direction, customFrame.frame ?? 0);

      if (asset != null) {
        assets.push(asset);
      }
    });

    if (assets.length === 0) return;

    return {
      assets: assets.flatMap((asset) => [asset, asset]),
      addition: false,
      kind: "EFFECT_DRAW_PART",
      z: 0,
      ink: this._sprite.ink,
    };
  }

  private _getAvatarAsset(direction: number, frame: number) {
    let displayDirection = 0;
    if (this._sprite.directions) {
      displayDirection = direction;
    }

    const flippedMeta = getBasicFlippedMetaData(displayDirection);
    displayDirection = flippedMeta.direction;

    if (this._sprite.member != null) {
      const id = getSpriteId(this._sprite.member, displayDirection, frame);

      const offsets = this._offsetsData.getOffsets(id);

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

interface CustomPartFrame {
  frame?: number;
  action?: AvatarActionInfo;
  dx?: number;
  dy?: number;
  dd?: number;
}
