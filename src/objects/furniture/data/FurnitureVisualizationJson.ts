import {
  FurnitureAnimationLayer,
  FurnitureDirectionLayer,
  FurnitureLayer,
} from "./interfaces/IFurnitureVisualizationData";

export interface FurnitureVisualizationJson {
  [size: string]: {
    layerCount: number;
    layers: FurnitureLayersJson;
    directions: FurnitureDirectionsJson;
    colors: FurnitureColorsJson;
    animations: FurnitureAnimationsJson;
  };
}

export type FurnitureLayersJson = {
  [id: string]: FurnitureLayer | undefined;
};

export type FurnitureDirectionsJson = {
  [id: string]:
    | {
        layers: {
          [id: string]: FurnitureDirectionLayer | undefined;
        };
      }
    | undefined;
};

export type FurnitureColorsJson = {
  [id: string]:
    | {
        layers: {
          [id: string]: { color: string } | undefined;
        };
      }
    | undefined;
};

export type FurnitureAnimationsJson = {
  [id: string]:
    | {
        layers: {
          [id: string]: FurnitureAnimationLayer | undefined;
        };
        transitionTo?: number;
      }
    | undefined;
};
