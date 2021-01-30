import { AvatarFigurePartType } from "../enum/AvatarFigurePartType";
import { AvatarActionInfo } from "../util/data/interfaces/IAvatarActionsData";
import {
  AvatarAnimationFrame,
  IAvatarAnimationData,
} from "../util/data/interfaces/IAvatarAnimationData";
import { IAvatarEffectData } from "../util/data/interfaces/IAvatarEffectData";
import { IAvatarOffsetsData } from "../util/data/interfaces/IAvatarOffsetsData";
import { IAvatarPartSetsData } from "../util/data/interfaces/IAvatarPartSetsData";
import {
  FigureDataPart,
  IFigureData,
} from "../util/data/interfaces/IFigureData";
import { IFigureMapData } from "../util/data/interfaces/IFigureMapData";
import { getAvatarDirection } from "../util/getAvatarDirection";
import {
  AvatarAsset,
  DefaultAvatarDrawPart,
  getAssetForFrame,
} from "../util/getAvatarDrawDefinition";

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

  private _frameOffsets: Map<number, { x: number; y: number }> = new Map();
  private _avatarOffsets = false;

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

  setActiveAction(action: AvatarActionInfo) {
    if (this._action != null && this._action.precedence < action.precedence) {
      // When the precedence of the present action is already lower than the new one, we should ignore it.
      return;
    }

    this._action = action;
  }

  setDirection(direction: number) {
    this._direction = getAvatarDirection(direction);
  }

  addCustomFrame(customFrame: CustomPartFrame) {
    if (this._avatarOffsets) return;

    this._customFrames.push(customFrame);
  }

  setDirectionOffset(offset: number) {
    this._directionOffset = offset;
  }

  setOffsets(
    action: AvatarActionInfo,
    frame: number,
    offsets: { x: number; y: number }
  ) {
    this._frameOffsets.set(frame, offsets);

    if (!this._avatarOffsets) {
      this._avatarOffsets = true;
      this._customFrames = [];
    }

    this._customFrames.push({
      action: action,
      frame: 0,
      dx: 0,
      dy: 0,
    });
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
      assets: this._assets.flatMap((asset) => [asset, asset]),
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
    return this._frameOffsets.get(frame) ?? { x: 0, y: 0 };
  }

  private _update() {
    const partInfo = this._partSetsData.getPartInfo(this.type);
    this._assets = [];

    // If any custom frames are set, use them instead of the default animation behavior.
    // This is usually used when effects override certain body parts and their actions/animations.
    if (this._customFrames.length > 0) {
      this._customFrames.forEach((customFrame, i) => {
        const action = customFrame.action;
        const baseDirection = this.getDirection(customFrame.dd);

        if (baseDirection == null) throw new Error("Invalid direction");

        const direction = getAvatarDirection(baseDirection);

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
          figureData: this._figureData,
          figureMap: this._figureMap,
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

    for (let i = 0; i < framesIndexed.length; i++) {
      const frame = framesIndexed[i];

      const asset = getAssetForFrame({
        animationFrame: frame,
        actionData: action,
        direction: direction,
        figureData: this._figureData,
        figureMap: this._figureMap,
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

export interface CustomPartFrame {
  action: AvatarActionInfo;
  frame: number;
  dx?: number;
  dy?: number;
  dd?: number;
}
