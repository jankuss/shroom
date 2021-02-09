import { IAvatarOffsetsData } from "../data/interfaces/IAvatarOffsetsData";
import { getBasicFlippedMetaData } from "./getFlippedMetaData";
import { getSpriteId } from "../structure/AvatarEffectPart";

export function getEffectSprite(
  member: string,
  direction: number,
  frame: number,
  offsetsData: IAvatarOffsetsData,
  hasDirection: boolean,
  handleFlipped: boolean
) {
  let id = getSpriteId(member, direction, frame);
  let offsets = offsetsData.getOffsets(id);
  let flip = false;

  if (handleFlipped && offsets == null) {
    const flippedMeta = getBasicFlippedMetaData(direction);

    id = getSpriteId(member, flippedMeta.direction, frame);
    offsets = offsetsData.getOffsets(id);
    flip = flippedMeta.flip;
  }

  if (!hasDirection) {
    id = getSpriteId(member, 0, frame);

    if (offsets == null) {
      offsets = offsetsData.getOffsets(id);
    }
  }

  return {
    id,
    offsets,
    flip,
  };
}
