import { MaskNode } from "../../interfaces/IRoomVisualization";
import { IFurnitureRoomVisualization } from "./BaseFurniture";

export class FurnitureVisualization implements IFurnitureRoomVisualization {
  constructor(private _container: PIXI.Container) {}

  public get container() {
    return this._container;
  }

  static fromContainer(container: PIXI.Container) {
    return new FurnitureVisualization(container);
  }

  addMask(maskId: string, element: PIXI.DisplayObject): MaskNode {
    return {
      remove: () => {},
    };
  }
}
