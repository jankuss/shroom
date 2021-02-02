import { IAvatarOffsetsData } from "../../util/data/interfaces/IAvatarOffsetsData";
import { getBasicFlippedMetaData } from "../../util/getFlippedMetaData";
import { getSpriteId } from "../AvatarEffectPart";

export function getEffectSprite(
  member: string,
  direction: number,
  frame: number,
  offsetsData: IAvatarOffsetsData
) {
  let id = getSpriteId(member, direction, frame);
  let offsets = offsetsData.getOffsets(id);
  let flip = false;

  if (offsets == null) {
    const flippedMeta = getBasicFlippedMetaData(direction);

    id = getSpriteId(member, flippedMeta.direction, frame);
    offsets = offsetsData.getOffsets(id);
    flip = flippedMeta.flip;
  }

  if (offsets == null) {
    const flippedMeta = getBasicFlippedMetaData(0);
    id = getSpriteId(member, 0, frame);
    offsets = offsetsData.getOffsets(id);
    flip = flippedMeta.flip;
  }

  return {
    id,
    offsets,
    flip,
  };
}
