import { notNullOrUndefined } from "../../../util/notNullOrUndefined";
import { AvatarAction } from "../enum/AvatarAction";
import {
  AvatarActionInfo,
  IAvatarActionsData,
} from "../data/interfaces/IAvatarActionsData";
import {
  AvatarEffectFrameFXPart,
  IAvatarEffectData,
} from "../data/interfaces/IAvatarEffectData";
import {
  Bodypart,
  IAvatarGeometryData,
} from "../data/interfaces/IAvatarGeometryData";
import { IAvatarPartSetsData } from "../data/interfaces/IAvatarPartSetsData";
import { AvatarAdditionPart } from "./AvatarAdditionPart";
import { AvatarPart } from "./AvatarPart";
import { IAvatarDrawablePart } from "./interface/IAvatarDrawablePart";

/**
 * A bodypart of the avatar. A bodypart manages multiple `AvatarPart` objects.
 */
export class AvatarBodyPart {
  private _additions: AvatarAdditionPart[] = [];

  constructor(
    private _bodyPart: Bodypart,
    private _parts: AvatarPart[],
    private _partSets: IAvatarPartSetsData,
    private _actions: IAvatarActionsData,
    private _geometry: IAvatarGeometryData
  ) {}

  public get z() {
    return this._bodyPart.z;
  }

  public get id() {
    return this._bodyPart.id;
  }

  public get parts() {
    return this._parts;
  }

  public addAddition(addition: AvatarAdditionPart) {
    this._additions.push(addition);
  }

  public getSortedParts(geometry: string): IAvatarDrawablePart[] {
    const baseParts = this._parts
      .map((part) => {
        const item = this._geometry.getBodyPartItem(
          geometry,
          this._bodyPart.id,
          part.type
        );
        if (item == null) return;

        return { part, item };
      })
      .filter(notNullOrUndefined)
      .sort((a, b) => a.item.radius - b.item.radius)
      .map((bodyPartItem) => {
        return bodyPartItem.part;
      });

    return [...baseParts, ...this._additions];
  }

  public setActiveAction(action: AvatarActionInfo) {
    if (action.activepartset == null) return;
    const activePart = this._partSets.getActivePartSet(action.activepartset);

    this._parts.forEach((part) => {
      if (!activePart.has(part.type)) return;

      part.setActiveAction(action);
    });
  }

  public setDirection(direction: number) {
    this._parts.forEach((part) => {
      part.setDirection(direction);
    });
  }

  public setDirectionOffset(offset: number) {
    this._parts.forEach((part) => {
      part.setDirectionOffset(offset);
    });
  }

  public setFrameRepeat(frameRepeat: number) {
    this._parts.forEach((part) => {
      part.setFrameRepeat(frameRepeat);
    });
  }

  public setEffectFrame(effect: IAvatarEffectData, frame: number) {
    const effectBodyPart = effect.getFrameBodyPart(this.id, frame);
    if (effectBodyPart == null) return;

    const action = this._actions.getAction(
      effectBodyPart.action as AvatarAction
    );

    this._parts.forEach((part) => {
      if (action != null) {
        part.addCustomFrame({
          action,
          frame: effectBodyPart.frame ?? 0,
          dd: effectBodyPart.dd,
          dx: effectBodyPart.dx,
          dy: effectBodyPart.dy,
        });
      }
    });
  }

  public setAvatarOffsets(avatarFrame: AvatarEffectFrameFXPart, frame: number) {
    this._parts.forEach((part) => {
      part.setAvatarOffsets(avatarFrame, frame);
    });

    this._additions.forEach((addition) => {
      addition.setAvatarOffsets(avatarFrame, frame);
    });
  }
}
