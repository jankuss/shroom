import { notNullOrUndefined } from "../../../util/notNullOrUndefined";
import { HitTexture } from "../../hitdetection/HitTexture";
import { FurnitureAssetsData } from "../data/FurnitureAssetsData";
import { FurnitureVisualizationData } from "../data/FurnitureVisualizationData";
import { IFurnitureVisualizationData } from "../data/interfaces/IFurnitureVisualizationData";
import { FurnitureExtraData } from "../FurnitureExtraData";
import { FurniDrawDefinition } from "./DrawDefinition";
import { getFurniDrawDefinition } from "./getFurniDrawDefinition";
import { parseAssets } from "./parseAssets";
import { parseStringAsync } from "./parseStringAsync";
import { parseVisualization } from "./visualization/parseVisualization";

export type GetFurniDrawDefinition = (
  direction: number,
  animation?: string
) => FurniDrawDefinition;

export type Hitmap = (
  x: number,
  y: number,
  transform: { x: number; y: number }
) => boolean;

export type LoadFurniResult = {
  getDrawDefinition: GetFurniDrawDefinition;
  getTexture: (name: string) => HitTexture | undefined;
  getExtraData: () => FurnitureExtraData;
  directions: number[];
  visualizationData: IFurnitureVisualizationData;
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
    getIndex: (
      type: string,
      revision?: number
    ) => Promise<{ visualization?: string; logic?: string }>;
  }
): Promise<LoadFurniResult> {
  const type = typeWithColor.split("*")[0];

  const assetsString = await options.getAssets(type, revision);
  const visualizationString = await options.getVisualization(type, revision);

  const assetsXml = await parseStringAsync(assetsString);
  const visualizationXml = await parseStringAsync(visualizationString);

  const indexData = await options.getIndex(type, revision);

  const assetMap = parseAssets(assetsXml);
  const visualization = parseVisualization(visualizationXml);

  const assetsData = new FurnitureAssetsData(assetsString);
  const visualizationData = new FurnitureVisualizationData(visualizationString);

  const loadTextures = async () => {
    const assetsToLoad = Array.from(assetMap.values()).filter(
      (asset) => asset.source == null || asset.source === asset.name
    );

    const loadedTextures = await Promise.all(
      assetsToLoad.map(async (asset) => {
        try {
          const imageUrl = await options.getAsset(type, asset.name, revision);
          const image = await HitTexture.fromUrl(imageUrl);

          return [asset.name, image] as const;
        } catch (e) {
          console.warn(`Failed to load furniture asset: ${asset.name}`, e);
          return null;
        }
      })
    );

    return new Map(loadedTextures.filter(notNullOrUndefined));
  };
  const textures = await loadTextures();

  const sortedDirections = [...visualization.directions].sort((a, b) => a - b);

  return {
    getDrawDefinition: (direction: number, animation?: string) =>
      getFurniDrawDefinition(
        {
          type: typeWithColor,
          direction,
          animation,
        },
        {
          assetsData,
          visualizationData,
        }
      ),
    getTexture: (name) => {
      const texture = textures.get(name);
      return texture;
    },
    getExtraData: () => {
      return indexData;
    },
    visualizationData,
    directions: sortedDirections,
  };
}
