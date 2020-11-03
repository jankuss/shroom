export type OffsetMap = Map<string, { offsetX: number; offsetY: number }>;

export function parseOffsetsFromManifest(manifestXml: any) {
  const offsetMap = new Map<string, { offsetX: number; offsetY: number }>();
  manifestXml.manifest.library[0].assets[0].asset.forEach((asset: any) => {
    const offsetStr = asset.param[0]["$"].value as string;
    const offsets = offsetStr.split(",").map(Number);

    offsetMap.set(asset["$"].name, {
      offsetX: offsets[0],
      offsetY: offsets[1]
    });
  });

  return offsetMap;
}
