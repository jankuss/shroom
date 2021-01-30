import { AvatarAction } from "../enum/AvatarAction";
import {
  AvatarActionInfo,
  IAvatarActionsData,
} from "../util/data/interfaces/IAvatarActionsData";
import { IAvatarEffectData } from "../util/data/interfaces/IAvatarEffectData";
import { Bodypart } from "../util/data/interfaces/IAvatarGeometryData";
import { IAvatarPartSetsData } from "../util/data/interfaces/IAvatarPartSetsData";
import { getAvatarDirection } from "../util/getAvatarDirection";
import { AvatarPart } from "./AvatarPart";

/**
 * A bodypart of the avatar. A bodypart manages multiple `AvatarPart` objects.
 */
export class AvatarBodyPart {
  constructor(
    private _bodyPart: Bodypart,
    private _parts: AvatarPart[],
    private _partSets: IAvatarPartSetsData,
    private _actions: IAvatarActionsData
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

  public setEffectFrame(effect: IAvatarEffectData, frame: number) {
    const effectBodyPart = effect.getFrameBodyPart(this.id, frame);
    if (effectBodyPart == null) return;

    this._parts.forEach((part) => {
      const action = this._actions.getAction(
        effectBodyPart.action as AvatarAction
      );

      if (action != null) {
        part.addCustomFrame({
          action,
          frame: effectBodyPart.frame,
          dd: effectBodyPart.dd,
          dx: effectBodyPart.dx,
          dy: effectBodyPart.dy,
        });
      }
    });
  }

  public setAvatarOffsets(effect: IAvatarEffectData, frame: number) {
    const effectBodyPart = effect.getFrameEffectPart("avatar", frame);

    if (effectBodyPart == null) return;

    this._parts.forEach((part) => {
      const action = this._actions.getAction(AvatarAction.Default);
      if (action == null) return;

      part.setOffsets(action, frame, {
        x: effectBodyPart.dx ?? 0,
        y: effectBodyPart.dy ?? 0,
      });
    });
  }
}
