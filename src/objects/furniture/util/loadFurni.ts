import { notNullOrUndefined } from "../../../util/notNullOrUndefined";
import { HitTexture } from "../../hitdetection/HitTexture";
import { IFurnitureAssetsData } from "../data/interfaces/IFurnitureAssetsData";
import { IFurnitureIndexData } from "../data/interfaces/IFurnitureIndexData";
import { IFurnitureVisualizationData } from "../data/interfaces/IFurnitureVisualizationData";
import { FurnitureExtraData } from "../FurnitureExtraData";
import { IFurnitureAssetBundle } from "../IFurnitureAssetBundle";
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
  bundle: IFurnitureAssetBundle
): Promise<LoadFurniResult> {
  const assetsData = await bundle.getAssets();
  const indexData = await bundle.getIndex();
  const visualizationData = await bundle.getVisualization();
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
          const image = await bundle.getTexture(asset.name);

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
