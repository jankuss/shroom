import { IFurnitureVisualizationView } from "./IFurnitureVisualizationView";

export interface IFurnitureVisualization {
  setView(view: IFurnitureVisualizationView): void;
  updateFrame(frame: number): void;
  updateDirection(direction: number): void;
  updateAnimation(animation: string | undefined): void;
  destroy(): void;
}
