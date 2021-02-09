import { AvatarFigurePartType } from "../enum/AvatarFigurePartType";
import { IAvatarAnimationData } from "../util/data/interfaces/IAvatarAnimationData";
import { IAvatarEffectData } from "../util/data/interfaces/IAvatarEffectData";
import { Bodypart } from "../util/data/interfaces/IAvatarGeometryData";
import { IAvatarOffsetsData } from "../util/data/interfaces/IAvatarOffsetsData";
import { IAvatarPartSetsData } from "../util/data/interfaces/IAvatarPartSetsData";
import { IFigureData } from "../util/data/interfaces/IFigureData";
import { IFigureMapData } from "../util/data/interfaces/IFigureMapData";
import { ParsedLook } from "../util/parseLookString";
import { AvatarPart } from "./AvatarPart";

export const basePartSet = new Set<AvatarFigurePartType>([
  AvatarFigurePartType.LeftHand,
  AvatarFigurePartType.RightHand,
  AvatarFigurePartType.Body,
  AvatarFigurePartType.Head,
]);

export class AvatarPartList {
  private _parts: AvatarPart[] = [];
  private _hiddenLayers: Set<string> = new Set();
  private _partsByType: Map<AvatarFigurePartType, AvatarPart[]> = new Map();

  constructor(
    look: ParsedLook,
    itemId: string | number | undefined,
    private _deps: AvatarPartListOptions
  ) {
    const { figureData } = _deps;

    look.forEach(({ setId, colorId }, setType) => {
      const parts = figureData.getParts(setType, setId.toString());
      const colorValue = figureData.getColor(setType, colorId.toString());
      const hiddenLayers: string[] = figureData.getHiddenLayers(
        setType,
        setId.toString()
      );

      hiddenLayers.forEach((layer) => this._hiddenLayers.add(layer));

      if (parts != null && parts.length > 0) {
        parts.forEach((part) => {
          const avatarPart = new AvatarPart(part, colorValue, _deps);

          this._registerPart(avatarPart);
        });
      }
    });

    if (itemId != null) {
      this._addItem(itemId);
    }

    basePartSet.forEach((partType) => {
      const partsForType = this._partsByType.get(
        partType as AvatarFigurePartType
      );

      if (partsForType == null || partsForType.length === 0) {
        this._registerPart(
          new AvatarPart(
            {
              id: "1",
              type: partType as AvatarFigurePartType,
              colorable: false,
              index: 0,
            },
            undefined,
            _deps
          )
        );
      }
    });
  }

  getPartsForBodyBart(bodyPart: Bodypart) {
    return bodyPart.items.flatMap((bodyPartItem) => {
      return (
        this._partsByType.get(bodyPartItem.id as AvatarFigurePartType) ?? []
      );
    });
  }

  getPartsForType(type: AvatarFigurePartType) {
    const parts = this._partsByType.get(type);
    if (parts == null) return [];

    const sortedParts = [...parts].sort((a, b) => a.index - b.index);
    return sortedParts;
  }

  public get parts() {
    return this._parts;
  }

  private _addItem(itemId: number | string) {
    this._registerPart(
      new AvatarPart(
        {
          type: "ri",
          colorable: false,
          id: itemId.toString(),
          index: 0,
        },
        undefined,
        this._deps
      )
    );
  }

  private _registerPart(avatarPart: AvatarPart) {
    const type = avatarPart.type as AvatarFigurePartType;
    this._parts.push(avatarPart);
    const current = this._partsByType.get(type) ?? [];
    this._partsByType.set(type, [...current, avatarPart]);
  }
}

interface AvatarPartListOptions {
  figureData: IFigureData;
  figureMap: IFigureMapData;
  animationData: IAvatarAnimationData;
  offsetsData: IAvatarOffsetsData;
  partSetsData: IAvatarPartSetsData;
}
