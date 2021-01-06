import { FurnitureAsset } from "../data/interfaces/IFurnitureAssetsData";
import { FurnitureLayer } from "../data/interfaces/IFurnitureVisualizationData";

export type BaseFurniDrawPart = {
  layerIndex: number;
  z?: number;
  shadow: boolean;
  frameRepeat: number;
  layer: FurnitureLayer | undefined;
  tint?: string;
  mask?: boolean;
  loopCount?: number;
};

export type FurniDrawPart = {
  assets: FurnitureAsset[];
} & BaseFurniDrawPart;

export interface FurniDrawDefinition {
  parts: FurniDrawPart[];
}
