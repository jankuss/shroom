import { notNullOrUndefined } from "../../../util/notNullOrUndefined";
import { HitTexture } from "../../hitdetection/HitTexture";
import { IFurnitureAssetsData } from "../data/interfaces/IFurnitureAssetsData";
import { IFurnitureIndexData } from "../data/interfaces/IFurnitureIndexData";
import { IFurnitureVisualizationData } from "../data/interfaces/IFurnitureVisualizationData";
import { FurnitureExtraData } from "../FurnitureExtraData";
import { FurniDrawDefinition } from "./DrawDefinition";
import { getFurniDrawDefinition } from "./getFurniDrawDefinition";

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
  options: LoadFurniOptions
): Promise<LoadFurniResult> {
  const type = typeWithColor.split("*")[0];

  const assetsData = await options.getAssets(type, revision);
  const indexData = await options.getIndex(type, revision);
  const visualizationData = await options.getVisualization(type, revision);
  const validDirections = visualizationData.getDirections(64);
  const sortedDirections = [...validDirections].sort((a, b) => a - b);

  const assetMap = assetsData.getAssets();

  const loadTextures = async () => {
    const assetsToLoad = Array.from(assetMap).filter(
      (asset) => asset.source == null || asset.source === asset.name
    );

    const loadedTextures = await Promise.all(
      assetsToLoad.map(async (asset) => {
        try {
          const imageUrl = await options.getTextureUrl(
            type,
            asset.name,
            revision
          );
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

interface LoadFurniOptions {
  getAssets: (type: string, revision?: number) => Promise<IFurnitureAssetsData>;
  getVisualization: (
    type: string,
    revision?: number
  ) => Promise<IFurnitureVisualizationData>;
  getTextureUrl: (
    type: string,
    name: string,
    revision?: number
  ) => Promise<string>;
  getIndex: (type: string, revision?: number) => Promise<IFurnitureIndexData>;
}
