import { HitTexture } from "../../hitdetection/HitTexture";
import { DrawDefinition } from "./DrawDefinition";
import { getFurniDrawDefinition } from "./getFurniDrawDefinition";
import { parseAssets } from "./parseAssets";
import { parseStringAsync } from "./parseStringAsync";
import { parseVisualization } from "./visualization/parseVisualization";

export type GetFurniDrawDefinition = (
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
  revision: number | undefined,
  options: {
    getAssets: (type: string, revision?: number) => Promise<string>;
    getVisualization: (type: string, revision?: number) => Promise<string>;
    getAsset: (
      type: string,
      name: string,
      revision?: number
    ) => Promise<string>;
  }
): Promise<LoadFurniResult> {
  const type = typeWithColor.split("*")[0];

  const assetsString = await options.getAssets(type, revision);
  const visualizationString = await options.getVisualization(type, revision);

  const assetsXml = await parseStringAsync(assetsString);
  const visualizationXml = await parseStringAsync(visualizationString);

  const assetMap = parseAssets(assetsXml);
  const visualization = parseVisualization(visualizationXml);

  const loadTextures = async () => {
    const assetsToLoad = Array.from(assetMap.values()).filter(
      (asset) => asset.source == null || asset.source === asset.name
    );

    const textures = new Map(
      await Promise.all(
        assetsToLoad.map(async (asset) => {
          const imageUrl = await options.getAsset(type, asset.name, revision);
          const image = await HitTexture.fromUrl(imageUrl);

          return [asset.name, image] as const;
        })
      )
    );

    return textures;
  };

  const textures = await loadTextures();

  return {
    getDrawDefinition: (direction: number, animation?: string) =>
      getFurniDrawDefinition({
        type: typeWithColor,
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
