import { BaseFurniture } from "./BaseFurniture";
import { IFurnitureVisualizationView } from "./IFurnitureVisualizationView";

export interface IFurnitureVisualization {
  isAnimated(animation?: string): boolean;
  setView(view: IFurnitureVisualizationView): void;
  updateFrame(frame: number): void;
  updateDirection(direction: number): void;
  updateAnimation(animation: string | undefined): void;
  update(furniture: BaseFurniture): void;
  destroy(): void;
}
