import { associateBy } from "../../../util/associateBy";
import { notNullOrUndefined } from "../../../util/notNullOrUndefined";
import { AvatarAction } from "../enum/AvatarAction";
import { AvatarFigurePartType } from "../enum/AvatarFigurePartType";
import { addMissingDrawOrderItems } from "../util/addMissingDrawOrderItems";
import {
  AvatarActionInfo,
  IAvatarActionsData,
} from "../util/data/interfaces/IAvatarActionsData";
import { IAvatarAnimationData } from "../util/data/interfaces/IAvatarAnimationData";
import { IAvatarEffectData } from "../util/data/interfaces/IAvatarEffectData";
import { IAvatarGeometryData } from "../util/data/interfaces/IAvatarGeometryData";
import { IAvatarOffsetsData } from "../util/data/interfaces/IAvatarOffsetsData";
import { IAvatarPartSetsData } from "../util/data/interfaces/IAvatarPartSetsData";
import { IFigureData } from "../util/data/interfaces/IFigureData";
import { IFigureMapData } from "../util/data/interfaces/IFigureMapData";
import { getDrawOrder } from "../util/drawOrder";
import { getAvatarDirection } from "../util/getAvatarDirection";
import {
  AvatarDependencies,
  AvatarDrawPart,
} from "../util/getAvatarDrawDefinition";
import { getDrawOrderForActions } from "../util/getDrawOrderForActions";
import { ParsedLook } from "../util/parseLookString";
import { AvatarAdditionPart } from "./AvatarAdditionPart";
import { AvatarBodyPart } from "./AvatarBodyPart";
import { AvatarBodyPartList } from "./AvatarBodyPartList";
import { AvatarEffectPart } from "./AvatarEffectPart";
import { AvatarPartList } from "./AvatarPartList";
import { BodyPartDrawOrder } from "./BodyPartDrawOrder";
import { IAvatarEffectPart } from "./interface/IAvatarEffectPart";

export class AvatarDrawDefinitionStructure implements IAvatarEffectPart {
  private _figureData: IFigureData;
  private _actionsData: IAvatarActionsData;
  private _geometry: IAvatarGeometryData;
  private _partSetsData: IAvatarPartSetsData;
  private _animationData: IAvatarAnimationData;
  private _offsetsData: IAvatarOffsetsData;
  private _figureMap: IFigureMapData;

  private _drawParts: AvatarDrawPart[] = [];

  private _direction: number;
  private _directionOffset = 0;

  private _partList: AvatarPartList;
  private _activeActions: AvatarActionInfo[];
  private _effectParts: AvatarEffectPart[];
  private _bodyParts: AvatarBodyPartList;

  private _additions: Map<AvatarBodyPart, AvatarAdditionPart[]> = new Map();

  constructor(
    private _options: Options,
    {
      figureData,
      actionsData,
      geometry,
      partSetsData,
      animationData,
      offsetsData,
      figureMap,
    }: AvatarDependencies
  ) {
    this._direction = _options.direction;
    this._figureData = figureData;
    this._actionsData = actionsData;
    this._geometry = geometry;
    this._partSetsData = partSetsData;
    this._animationData = animationData;
    this._offsetsData = offsetsData;
    this._figureMap = figureMap;

    const effect = _options.effect;

    const partList = this._getPartsForLook(_options.look);

    const bodyParts = AvatarBodyPartList.create(
      partList,
      this._options.item != null,
      { actionsData, geometry, partSetsData, offsetsData }
    );
    const activeActions = this._getActiveActions();

    this._bodyParts = bodyParts;

    bodyParts.applyActions(activeActions);
    bodyParts.setBodyPartDirection(
      this._options.direction,
      this._options.headDirection
    );

    const effectParts = new Map<string, IAvatarEffectPart>();
    this._effectParts = [];

    if (effect != null) {
      bodyParts.applyEffectAdditions(effect);

      effect.getSprites().forEach((sprite) => {
        if (sprite.id === "avatar") {
          effectParts.set(sprite.id, this);
          return;
        }

        const effectPart = new AvatarEffectPart(
          sprite,
          this._actionsData,
          this._offsetsData,
          effect
        );

        effectParts.set(sprite.id, effectPart);

        this._effectParts.push(effectPart);
      });

      for (let i = 0; i < effect.getFrameCount(); i++) {
        bodyParts.setEffectFrame(effect, i);

        effectParts.forEach((effectPart) =>
          effectPart.setEffectFrame(effect, i)
        );
      }

      effectParts.forEach((effectPart) => {
        effectPart.setEffectFrameDefaultIfNotSet();
        effectPart.setDirection(_options.direction);
      });

      bodyParts.setAdditionsDirection(_options.direction);
    }

    const directionOffset = effect?.getDirection()?.offset ?? 0;

    if (directionOffset != null) {
      effectParts.forEach((part) => {
        part.setDirectionOffset(directionOffset);
      });

      bodyParts.setDirectionOffset(directionOffset);
    }

    this._activeActions = activeActions;
    this._partList = partList;
  }

  setDirection(direction: number): void {
    this._direction = direction;
  }

  setDirectionOffset(offset: number): void {
    this._directionOffset = offset;
  }

  setEffectFrame(effect: IAvatarEffectData, frame: number): void {
    const avatarFrameData = effect.getFrameEffectPart("avatar", frame);
    if (avatarFrameData == null) return;

    this._bodyParts.setAvatarOffsets(avatarFrameData, frame);

    this._effectParts.forEach((effectPart) => {
      effectPart.setAvatarOffsets(avatarFrameData, frame);
    });
  }

  setEffectFrameDefaultIfNotSet(): void {
    // Do nothing
  }

  public getDrawDefinition(): AvatarDrawPart[] {
    const drawOrderId = getDrawOrderForActions(this._activeActions, {
      hasItem: this._options.item != null,
    });

    const drawOrder = this._getDrawOrder(
      this._activeActions,
      getAvatarDirection(this._direction + this._directionOffset)
    );

    const drawOrderDirection = getAvatarDirection(
      this._direction + this._directionOffset
    );
    const drawOrderBodyParts = BodyPartDrawOrder.getDrawOrder(
      drawOrderDirection,
      drawOrderId
    );

    if (drawOrderBodyParts == null) return [];

    const sortedParts = drawOrderBodyParts
      .map((id) => this._bodyParts.getBodyPartById(id))
      .filter(notNullOrUndefined)
      .flatMap((bodyPart) => {
        return bodyPart.getSortedParts("vertical");
      });

    const drawParts: AvatarDrawPart[] = sortedParts
      .map((part) => part.getDrawDefinition())
      .filter(notNullOrUndefined);

    const effectDrawParts = this._effectParts
      .map((part) => part.getDrawDefinition())
      .filter(notNullOrUndefined);

    const sortedDrawParts = [...drawParts, ...effectDrawParts].sort(
      (a, b) => a.z - b.z
    );

    return sortedDrawParts;
  }

  private _getDrawOrder(actions: AvatarActionInfo[], direction: number) {
    const drawOrderId = getDrawOrderForActions(actions, {
      hasItem: this._options.item != null,
    });

    const drawOrderRaw =
      getDrawOrder(drawOrderId, direction) ?? getDrawOrder("std", direction);

    // Since the draworder file has missing parts, we add them here.
    const drawOrderAdditional = addMissingDrawOrderItems(new Set(drawOrderRaw));

    return drawOrderAdditional;
  }

  private _getPartsForLook(look: ParsedLook) {
    const avatarList = new AvatarPartList(look, this._options.item, {
      figureData: this._figureData,
      animationData: this._animationData,
      figureMap: this._figureMap,
      offsetsData: this._offsetsData,
      partSetsData: this._partSetsData,
    });

    return avatarList;
  }

  private _getActiveActions() {
    const actions = new Set(this._options.actions).add(AvatarAction.Default);

    return this._actionsData
      .getActions()
      .filter((info) => actions.has(info.id))
      .sort((a, b) => {
        if (a.precedence < b.precedence) return 1;
        if (a.precedence > b.precedence) return -1;

        return 0;
      });
  }
}

interface Options {
  look: ParsedLook;
  actions: Set<string>;
  direction: number;
  headDirection?: number;
  frame: number;
  item?: string | number;
  effect?: IAvatarEffectData;
}
