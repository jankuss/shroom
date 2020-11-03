export type Asset = {
  x: number;
  y: number;
  name: string;
  flipH: boolean;
  source?: string;
};

export type AssetMap = Map<string, Asset>;

export function parseAssets(xml: any): AssetMap {
  const assets: any[] = xml.assets.asset;
  const assetMap = new Map<string, Asset>();

  assets.forEach(asset => {
    const data = asset["$"];
    const x = Number(data.x);
    const y = Number(data.y);

    const flipH = data.flipH === "1";

    if (data.source != null) {
      assetMap.set(data.name, {
        flipH: flipH,
        source: data.source,
        x,
        y,
        name: data.name
      });
    } else {
      assetMap.set(data.name, { flipH: flipH, x, y, name: data.name });
    }
  });

  return assetMap;
}
