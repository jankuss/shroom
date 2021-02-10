import { AvatarFigurePartType } from "../enum/AvatarFigurePartType";
import { AvatarActionInfo } from "../data/interfaces/IAvatarActionsData";
import {
  AvatarAnimationFrame,
  IAvatarAnimationData,
} from "../data/interfaces/IAvatarAnimationData";
import { AvatarEffectFrameFXPart } from "../data/interfaces/IAvatarEffectData";
import { IAvatarOffsetsData } from "../data/interfaces/IAvatarOffsetsData";
import { IAvatarPartSetsData } from "../data/interfaces/IAvatarPartSetsData";
import { FigureDataPart, IFigureData } from "../data/interfaces/IFigureData";
import { IFigureMapData } from "../data/interfaces/IFigureMapData";
import { getAvatarDirection } from "../util/getAvatarDirection";
import { getAssetForFrame } from "../util/getAssetForFrame";
import { AvatarAsset, DefaultAvatarDrawPart } from "../types";

export class AvatarPart {
  private _action: AvatarActionInfo | undefined;
  private _direction: number | undefined;
  private _directionOffset = 0;

  private _animationData: IAvatarAnimationData;
  private _figureData: IFigureData;
  private _figureMap: IFigureMapData;
  private _offsetsData: IAvatarOffsetsData;
  private _partSetsData: IAvatarPartSetsData;
  private _assets: AvatarAsset[] = [];
  private _customFrames: CustomPartFrame[] = [];
  private _frameRepeat = 1;

  private _offsets: Map<number, AvatarEffectFrameFXPart> = new Map();

  constructor(
    private _figureDataPart: FigureDataPart,
    private _color: string | undefined,
    {
      animationData,
      figureData,
      figureMap,
      offsetsData,
      partSetsData,
    }: {
      animationData: IAvatarAnimationData;
      figureData: IFigureData;
      figureMap: IFigureMapData;
      offsetsData: IAvatarOffsetsData;
      partSetsData: IAvatarPartSetsData;
    }
  ) {
    this._animationData = animationData;
    this._figureData = figureData;
    this._figureMap = figureMap;
    this._offsetsData = offsetsData;
    this._partSetsData = partSetsData;
  }

  public get type() {
    return this._figureDataPart.type;
  }

  public get index() {
    return this._figureDataPart.index;
  }

  setFrameRepeat(value: number) {
    this._frameRepeat = value;
  }

  setActiveAction(action: AvatarActionInfo) {
    this._action = action;
  }

  setDirection(direction: number) {
    this._direction = getAvatarDirection(direction);
  }

  addCustomFrame(customFrame: CustomPartFrame) {
    this._customFrames.push(customFrame);
  }

  setDirectionOffset(offset: number) {
    this._directionOffset = offset;
  }

  setAvatarOffsets(avatarFrame: AvatarEffectFrameFXPart, frame: number) {
    this._offsets.set(frame, avatarFrame);
  }

  getDirection(offset = 0) {
    if (this._direction == null) return;

    return getAvatarDirection(this._direction + this._directionOffset + offset);
  }

  /**
   * Gets the draw definition for this specific part.
   * This is a description how this part is drawn on the screen.
   */
  getDrawDefinition(): DefaultAvatarDrawPart | undefined {
    this._update();

    if (this._assets.length === 0) {
      return;
    }

    return {
      assets: this._assets.flatMap((asset) =>
        new Array(this._frameRepeat).fill(0).map(() => asset)
      ),
      color: this._figureDataPart.colorable ? `#${this._color}` : undefined,
      index: this._figureDataPart.index,
      kind: "AVATAR_DRAW_PART",
      mode:
        this._figureDataPart.type !== "ey" && this._figureDataPart.colorable
          ? "colored"
          : "just-image",
      type: this._figureDataPart.type,
      z: 0,
    };
  }

  private _getOffsetForFrame(frame: number) {
    const data = this._offsets.get(frame);
    if (data == null) return { x: 0, y: 0 };

    return {
      x: data.dx ?? 0,
      y: data.dy ?? 0,
    };
  }

  private _update() {
    const partInfo = this._partSetsData.getPartInfo(this.type);
    this._assets = [];

    // If any custom frames are set, use them instead of the default animation behavior.
    // This is usually used when effects override certain body parts and their actions/animations.
    if (this._customFrames.length > 0) {
      this._customFrames.forEach((customFrame, i) => {
        const action = customFrame.action;
        const direction = this.getDirection(customFrame.dd);

        if (direction == null) throw new Error("Invalid direction");

        const frame = this._animationData.getAnimationFrame(
          action.id,
          this.type,
          customFrame.frame
        );

        const offset = this._getOffsetForFrame(i);

        const asset = getAssetForFrame({
          animationFrame: frame,
          actionData: action,
          direction: direction,
          offsetsData: this._offsetsData,
          partId: this._figureDataPart.id,
          partType: this._figureDataPart.type as AvatarFigurePartType,
          partTypeFlipped: partInfo?.flippedSetType as AvatarFigurePartType,
          offsetX: (customFrame.dx ?? 0) + offset.x,
          offsetY: (customFrame.dy ?? 0) + offset.y,
        });

        if (asset != null) {
          this._assets.push(asset);
        }
      });

      return;
    }

    const action = this._action;
    const direction = this.getDirection();

    if (action == null) return;
    if (direction == null) return;

    const frames = this._animationData.getAnimationFrames(action.id, this.type);

    let framesIndexed: (
      | AvatarAnimationFrame
      | undefined
    )[] = frames.flatMap((frame) => new Array(frame.repeats).fill(frame));

    if (framesIndexed.length === 0) {
      framesIndexed = [undefined];
    }

    if (this._offsets.size > 0) {
      this._offsets.forEach((offset) => {
        const animationFrame = this._animationData.getAnimationFrame(
          action.id,
          this.type,
          offset.frame ?? 0
        );

        const asset = getAssetForFrame({
          animationFrame: animationFrame,
          actionData: action,
          direction: direction,
          offsetsData: this._offsetsData,
          partId: this._figureDataPart.id,
          partType: this._figureDataPart.type as AvatarFigurePartType,
          partTypeFlipped: partInfo?.flippedSetType as AvatarFigurePartType,
          offsetX: offset.dx,
          offsetY: offset.dy,
        });

        if (asset != null) {
          this._assets.push(asset);
        }
      });
    } else {
      for (let i = 0; i < framesIndexed.length; i++) {
        const frame = framesIndexed[i];

        const asset = getAssetForFrame({
          animationFrame: frame,
          actionData: action,
          direction: direction,
          offsetsData: this._offsetsData,
          partId: this._figureDataPart.id,
          partType: this._figureDataPart.type as AvatarFigurePartType,
          partTypeFlipped: partInfo?.flippedSetType as AvatarFigurePartType,
        });

        if (asset != null) {
          this._assets.push(asset);
        }
      }
    }
  }
}

export interface CustomPartFrame {
  action: AvatarActionInfo;
  frame: number;
  dx?: number;
  dy?: number;
  dd?: number;
}
