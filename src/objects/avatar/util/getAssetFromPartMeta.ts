import { IAvatarOffsetsData } from "../data/interfaces/IAvatarOffsetsData";

export function getAssetFromPartMeta(
  assetPartDefinition: string,
  assetInfoFrame: { flipped: boolean; swapped: boolean; asset: string },
  offsetsData: IAvatarOffsetsData,
  { offsetX, offsetY }: { offsetX: number; offsetY: number }
) {
  const offsets = offsetsData.getOffsets(assetInfoFrame.asset);

  if (offsets == null) return;

  const { x: offsetsX, y: offsetsY } = applyOffsets({
    offsets,
    customOffsets: { offsetX, offsetY },
    flipped: assetInfoFrame.flipped,
    lay: assetPartDefinition === "lay",
  });

  if (isNaN(offsetsX)) throw new Error("Invalid x offset");
  if (isNaN(offsetsY)) throw new Error("Invalid y offset");

  return {
    fileId: assetInfoFrame.asset,
    library: "",
    mirror: assetInfoFrame.flipped,
    x: offsetsX,
    y: offsetsY,
  };
}

export function applyOffsets({
  offsets,
  customOffsets: { offsetX, offsetY },
  flipped,
  lay,
}: {
  flipped: boolean;
  offsets: { offsetX: number; offsetY: number };
  customOffsets: { offsetX: number; offsetY: number };
  lay: boolean;
}) {
  let offsetsX = 0;
  let offsetsY = 0;

  offsetsY = -offsets.offsetY + offsetY;

  if (flipped) {
    offsetsX = 64 + offsets.offsetX - offsetX;
  } else {
    offsetsX = -offsets.offsetX - offsetX;
  }

  if (lay) {
    if (flipped) {
      offsetsX -= 52;
    } else {
      offsetsX += 52;
    }
  }

  offsetsY = offsetsY + 16;

  return {
    x: offsetsX,
    y: offsetsY,
  };
}
