import { FurnitureAsset } from "../data/interfaces/IFurnitureAssetsData";
import { FurnitureLayer } from "../data/interfaces/IFurnitureVisualizationData";

export type FurniDrawPart = {
  z?: number;
  shadow: boolean;
  frameRepeat: number;
  asset: FurnitureAsset | undefined;
  layer: FurnitureLayer | undefined;
  tint?: string;
  assets?: FurnitureAsset[];
  mask?: boolean;
  loopCount?: number;
};

export interface FurniDrawDefinition {
  parts: FurniDrawPart[];
  frameCount?: number;
  transitionTo?: number;
}
