import * as PIXI from "pixi.js";
import { IRoomVisualization } from "../../interfaces/IRoomVisualization";

export class RoomVisualization
  extends PIXI.Container
  implements IRoomVisualization {
  private container: PIXI.Container = new PIXI.Container();
  private cursorLayer: PIXI.Container = new PIXI.Container();
  private plane: PIXI.Container = new PIXI.Container();

  constructor() {
    super();
    this.container.sortableChildren = true;
    this.plane.sortableChildren = true;
    this.plane.cacheAsBitmap = true;

    this.addChild(this.plane);
    this.addChild(this.container);
    this.addChild(this.cursorLayer);
  }

  addCursorChild(element: PIXI.DisplayObject): void {
    this.cursorLayer.addChild(element);
  }

  addMask(element: PIXI.Sprite): void {}

  disableCache() {
    this.plane.cacheAsBitmap = false;
  }

  enableCache() {
    this.plane.cacheAsBitmap = true;
  }

  addPlaneChild(element: PIXI.DisplayObject): void {
    this.plane.addChild(element);
  }

  addContainerChild(element: PIXI.DisplayObject): void {
    this.container.addChild(element);
  }
}
