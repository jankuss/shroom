import { associateBy } from "../../../util/associateBy";
import { notNullOrUndefined } from "../../../util/notNullOrUndefined";
import {
  AvatarActionInfo,
  IAvatarActionsData,
} from "../data/interfaces/IAvatarActionsData";
import {
  AvatarEffectFrameFXPart,
  IAvatarEffectData,
} from "../data/interfaces/IAvatarEffectData";
import { IAvatarGeometryData } from "../data/interfaces/IAvatarGeometryData";
import { IAvatarOffsetsData } from "../data/interfaces/IAvatarOffsetsData";
import { IAvatarPartSetsData } from "../data/interfaces/IAvatarPartSetsData";
import { AvatarAdditionPart } from "./AvatarAdditionPart";
import { AvatarBodyPart } from "./AvatarBodyPart";
import { AvatarPartList } from "./AvatarPartList";

export class AvatarBodyPartList {
  private _bodyPartsById = new Map<string, AvatarBodyPart>();
  private _additions = new Map<AvatarBodyPart, AvatarAdditionPart[]>();
  private _actionsData: IAvatarActionsData;
  private _offsetsData: IAvatarOffsetsData;
  private _partSetsData: IAvatarPartSetsData;
  private _additionsArr: AvatarAdditionPart[] = [];

  constructor(
    private _bodyParts: AvatarBodyPart[],
    {
      actionsData,
      offsetsData,
      partSetsData,
    }: {
      actionsData: IAvatarActionsData;
      offsetsData: IAvatarOffsetsData;
      partSetsData: IAvatarPartSetsData;
    }
  ) {
    this._bodyPartsById = associateBy(
      this._bodyParts,
      (bodyPart) => bodyPart.id
    );

    this._actionsData = actionsData;
    this._offsetsData = offsetsData;
    this._partSetsData = partSetsData;
  }

  static create(
    partList: AvatarPartList,
    hasItem: boolean,
    {
      geometry,
      partSetsData,
      actionsData,
      offsetsData,
    }: {
      geometry: IAvatarGeometryData;
      partSetsData: IAvatarPartSetsData;
      actionsData: IAvatarActionsData;
      offsetsData: IAvatarOffsetsData;
    }
  ) {
    const bodyPartIds = [...geometry.getBodyParts("full")];

    if (hasItem) {
      bodyPartIds.push("rightitem");
    }

    const bodyParts = bodyPartIds
      .map((id) => geometry.getBodyPart("vertical", id))
      .filter(notNullOrUndefined)
      .map(
        (bodyPart) =>
          new AvatarBodyPart(
            bodyPart,
            partList.getPartsForBodyBart(bodyPart),
            partSetsData,
            actionsData,
            geometry
          )
      )
      .sort((a, b) => a.z - b.z);

    return new AvatarBodyPartList(bodyParts, {
      actionsData,
      offsetsData,
      partSetsData,
    });
  }

  applyActions(actions: AvatarActionInfo[]) {
    actions.forEach((action) => {
      this._bodyParts.forEach((bodyPart) => {
        bodyPart.setActiveAction(action);
      });
    });
  }

  applyEffectAdditions(effect: IAvatarEffectData) {
    effect.getAddtions().forEach((sprite) => {
      const bodyPart =
        sprite.align != null ? this._getBodyPartById(sprite.align) : undefined;
      if (bodyPart != null) {
        const current = this._additions.get(bodyPart) ?? [];
        const additionPart = new AvatarAdditionPart(
          sprite,
          this._actionsData,
          this._offsetsData,
          this._partSetsData
        );

        this._additions.set(bodyPart, [...current, additionPart]);
        this._additionsArr.push(additionPart);

        bodyPart.addAddition(additionPart);
      }
    });
  }

  setEffectFrame(effect: IAvatarEffectData, frame: number) {
    this._bodyParts.forEach((bodyPart) => {
      bodyPart.setEffectFrame(effect, frame);
      bodyPart.setFrameRepeat(2);
    });

    this._additionsArr.forEach((addition) => {
      addition.setEffectFrame(effect, frame);
    });
  }

  setAvatarOffsets(avatarFrameData: AvatarEffectFrameFXPart, frame: number) {
    this._bodyParts.forEach((bodyPart) =>
      bodyPart.setAvatarOffsets(avatarFrameData, frame)
    );
  }

  setAdditionsDirection(direction: number) {
    this._additionsArr.forEach((addition) => addition.setDirection(direction));
  }

  setDirectionOffset(offset: number) {
    this._additionsArr.forEach((addition) =>
      addition.setDirectionOffset(offset)
    );
    this._bodyParts.forEach((bodyPart) => bodyPart.setDirectionOffset(offset));
  }

  setBodyPartDirection(direction: number, headDirection?: number) {
    this._bodyParts.forEach((bodyPart) => {
      if (bodyPart.id === "head") {
        bodyPart.setDirection(headDirection ?? direction);
      } else {
        bodyPart.setDirection(direction);
      }
    });
  }

  getBodyPartById(id: string) {
    return this._getBodyPartById(id);
  }

  private _getBodyPartById(id: string) {
    return this._bodyPartsById.get(id);
  }
}
