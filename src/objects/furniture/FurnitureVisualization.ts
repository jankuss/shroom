import { IFurnitureVisualization } from "./BaseFurniture";

export class FurnitureVisualization implements IFurnitureVisualization {
  constructor(private _container: PIXI.Container) {}

  public get container() {
    return this._container;
  }

  static fromContainer(container: PIXI.Container) {
    return new FurnitureVisualization(container);
  }

  addMask(maskId: string, element: PIXI.DisplayObject): void {}
}
