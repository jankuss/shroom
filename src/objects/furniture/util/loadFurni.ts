import * as PIXI from "pixi.js";
import { HitTexture } from "../../hitdetection/HitTexture";

import { DrawDefinition } from "./DrawDefinition";
import { getFurniDrawDefinition } from "./getFurniDrawDefinition";
import { parseAssets } from "./parseAssets";
import { parseStringAsync } from "./parseStringAsync";
import { parseVisualization } from "./visualization/parseVisualization";

export type GetFurniDrawDefinition = (
  type: string,
  direction: number,
  animation?: string
) => DrawDefinition;

export type Hitmap = (
  x: number,
  y: number,
  transform: { x: number; y: number }
) => boolean;

export type LoadFurniResult = {
  getDrawDefinition: GetFurniDrawDefinition;
  getTexture: (name: string) => HitTexture;
};

export async function loadFurni(
  typeWithColor: string,
  revision: number,
  options: {
    getAssets: (type: string, revision: number) => Promise<string>;
    getVisualization: (type: string, revision: number) => Promise<string>;
    getAsset: (type: string, name: string, revision: number) => Promise<string>;
  }
): Promise<LoadFurniResult> {
  const type = typeWithColor.split("*")[0];

  const assetsString = await options.getAssets(type, revision);
  const visualizationString = await options.getVisualization(type, revision);

  const assetsXml = await parseStringAsync(assetsString);
  const visualizationXml = await parseStringAsync(visualizationString);

  const assetMap = parseAssets(assetsXml);
  const visualization = parseVisualization(visualizationXml);

  function generateHitMap(image: HTMLImageElement) {
    const canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;
    const context = canvas.getContext("2d");

    if (context == null) throw new Error("Invalid context 2d");

    const threshold = 25;

    const w = canvas.width;
    const h = canvas.height;
    context.drawImage(image, 0, 0);

    let imageData = context.getImageData(0, 0, w, h);

    let hitmap = new Uint32Array(Math.ceil((w * h) / 32));
    for (let i = 0; i < w * h; i++) {
      let ind1 = i % 32;
      let ind2 = (i / 32) | 0;
      if (imageData.data[i * 4 + 3] >= threshold) {
        hitmap[ind2] = hitmap[ind2] | (1 << ind1);
      }
    }

    return hitmap;
  }

  const preloadAssets = async () => {
    const assetsToLoad = Array.from(assetMap.values()).filter(
      (asset) => asset.source == null || asset.source === asset.name
    );

    const buffers = new Map(
      await Promise.all(
        assetsToLoad.map(async (asset) => {
          const imageUrl = await options.getAsset(type, asset.name, revision);
          const image = await HitTexture.fromUrl(imageUrl);

          return [asset.name, image] as const;
        })
      )
    );

    return buffers;
  };

  const textures = await preloadAssets();

  return {
    getDrawDefinition: (type: string, direction: number, animation?: string) =>
      getFurniDrawDefinition({
        type,
        direction,
        visualization,
        assetMap,
        animation,
      }),
    getTexture: (name) => {
      const texture = textures.get(name);
      if (texture == null) throw new Error(`Invalid texture: ${name}`);

      return texture;
    },
  };
}
