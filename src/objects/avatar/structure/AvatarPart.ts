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
import {
  AvatarAsset,
  DefaultAvatarDrawPart,
  getAssetForFrame,
} from "../util/getAvatarDrawDefinition";

export class AvatarPart {
  private _action: AvatarActionInfo | undefined;
  private _direction: number | undefined;

  private _animationData: IAvatarAnimationData;
  private _figureData: IFigureData;
  private _figureMap: IFigureMapData;
  private _offsetsData: IAvatarOffsetsData;
  private _partSetsData: IAvatarPartSetsData;
  private _assets: AvatarAsset[] = [];
  private _customFrames: CustomPartFrame[] = [];

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
    this._direction = direction;
  }

  addCustomFrame(customFrame: CustomPartFrame) {
    this._customFrames.push(customFrame);
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

  private _update() {
    const partInfo = this._partSetsData.getPartInfo(this.type);
    this._assets = [];

    // If any custom frames are set, use them instead of the default animation behavior.
    // This is usually used when effects override certain body parts and their actions/animations.
    if (this._customFrames.length > 0) {
      this._customFrames.forEach((customFrame) => {
        const action = customFrame.action;
        if (this._direction == null) throw new Error("Invalid direction");

        const direction = this._direction + (customFrame.dd ?? 0);

        const frame = this._animationData.getAnimationFrame(
          action.id,
          this.type,
          customFrame.frame
        );

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
          offsetX: customFrame.dx ?? 0,
          offsetY: customFrame.dy ?? 0,
        });

        if (asset != null) {
          this._assets.push(asset);
        }
      });

      return;
    }

    const action = this._action;
    const direction = this._direction;

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
