import { IFurnitureVisualizationData } from "./data/interfaces/IFurnitureVisualizationData";

export interface IFurnitureVisualizationView {
  setDisplayAnimation(animation?: string): void;
  setDisplayDirection(direction: number): void;

  updateDisplay(): void;
  getLayers(): IFurnitureVisualizationLayer[];
  getVisualizationData(): IFurnitureVisualizationData;
}

export interface IFurnitureVisualizationLayer {
  frameRepeat: number;
  layerIndex: number;
  assetCount: number;
  setCurrentFrameIndex(value: number): void;
}
