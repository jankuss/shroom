import { IAvatarOffsetsData } from "./data/interfaces/IAvatarOffsetsData";

export function getAssetFromPartMeta(
  assetPartDefinition: string,
  libraryId: string,
  assetInfoFrame: { flipped: boolean; swapped: boolean; asset: string },
  offsetsData: IAvatarOffsetsData,
  { offsetX, offsetY }: { offsetX: number; offsetY: number }
) {
  const offsets = offsetsData.getOffsets(assetInfoFrame.asset);

  if (offsets == null) return;

  let offsetsX = 0;
  let offsetsY = 0;

  offsetsY = -offsets.offsetY + offsetY;

  if (assetInfoFrame.flipped) {
    offsetsX = 64 + offsets.offsetX - offsetX;
  } else {
    offsetsX = -offsets.offsetX - offsetX;
  }

  if (assetPartDefinition === "lay") {
    if (assetInfoFrame.flipped) {
      offsetsX -= 52;
    } else {
      offsetsX += 52;
    }
  }

  if (isNaN(offsetsX)) throw new Error("Invalid x offset");
  if (isNaN(offsetsY)) throw new Error("Invalid y offset");

  return {
    fileId: assetInfoFrame.asset,
    library: libraryId,
    mirror: assetInfoFrame.flipped,
    x: offsetsX,
    y: offsetsY + 16,
  };
}
