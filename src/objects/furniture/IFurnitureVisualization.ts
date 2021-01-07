import { BaseFurniture } from "./BaseFurniture";
import { IFurniture } from "./IFurniture";
import { IFurnitureVisualizationView } from "./IFurnitureVisualizationView";

export interface IFurnitureVisualization {
  setView(view: IFurnitureVisualizationView): void;
  updateFrame(frame: number): void;
  updateDirection(direction: number): void;
  updateAnimation(animation: string | undefined): void;
  update(furniture: BaseFurniture): void;
  destroy(): void;
}
