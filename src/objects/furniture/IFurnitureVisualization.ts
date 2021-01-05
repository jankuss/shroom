import { IFurnitureVisualizationView } from "./IFurnitureVisualizationView";

export interface IFurnitureVisualization {
  update(view: IFurnitureVisualizationView): void;
  updateFrame(frame: number): void;
  destroy(): void;
}
