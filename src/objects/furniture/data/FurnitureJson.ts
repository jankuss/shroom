import { FurnitureAssetsJson } from "./FurnitureAssetsJson";
import { FurnitureIndexJson } from "./FurnitureIndexJson";
import { FurnitureVisualizationJson } from "./FurnitureVisualizationJson";

export interface FurnitureJson {
  visualization: FurnitureVisualizationJson;
  assets: FurnitureAssetsJson;
  index: FurnitureIndexJson;
  spritesheet: any;
}
