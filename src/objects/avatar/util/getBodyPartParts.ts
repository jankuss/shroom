import { Bodypart } from "./data/interfaces/IAvatarGeometryData";
import { AvatarFigurePartType } from "../enum/AvatarFigurePartType";
import { PartData } from "./getPartDataForParsedLook";
import { basePartSet } from "./getAvatarDrawDefinition";

export function getBodyPartParts(
  bodyPart: Bodypart,
  {
    itemId,
    partByType,
  }: { itemId?: number | string; partByType: Map<string, PartData[]> }
) {
  return bodyPart.items
    .flatMap((item): PartData[] | PartData => {
      if (item.id === AvatarFigurePartType.RightHandItem && itemId != null) {
        return {
          type: AvatarFigurePartType.RightHandItem,
          color: undefined,
          colorable: false,
          hiddenLayers: [],
          id: itemId.toString(),
          index: 0,
        };
      }

      const partsForType = partByType.get(item.id);
      if (partsForType == null) {
        if (basePartSet.has(item.id as AvatarFigurePartType)) {
          return [
            {
              id: "1",
              type: item.id,
              color: undefined,
              colorable: false,
              hiddenLayers: [],
              index: 0,
            },
          ];
        }

        return [];
      }

      return partsForType;
    })
    .map((part) => ({ ...part, bodypart: bodyPart }));
}
