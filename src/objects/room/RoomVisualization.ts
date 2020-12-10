import * as PIXI from "pixi.js";
import { IRoomVisualization } from "../../interfaces/IRoomVisualization";

export class RoomVisualization
  extends PIXI.Container
  implements IRoomVisualization {
  private container: PIXI.Container = new PIXI.Container();
  private cursorLayer: PIXI.Container = new PIXI.Container();
  private plane: PIXI.Container = new PIXI.Container();

  private behindWallPlane: PIXI.Container = new PIXI.Container();
  private floorPlane: PIXI.Container = new PIXI.Container();
  private wallPlane: PIXI.Container = new PIXI.Container();
  private tileCursorPlane: PIXI.Container = new PIXI.Container();

  constructor() {
    super();
    this.container.sortableChildren = true;
    this.behindWallPlane.sortableChildren = true;

    this.plane.addChild(this.wallPlane);
    this.plane.addChild(this.floorPlane);

    this.plane.sortableChildren = true;
    this.plane.cacheAsBitmap = true;

    this.addChild(this.behindWallPlane);
    this.addChild(this.plane);
    this.addChild(this.tileCursorPlane);
    this.addChild(this.container);
    this.addChild(this.cursorLayer);
  }

  addTileCursorChild(element: PIXI.DisplayObject): void {
    this.tileCursorPlane.addChild(element);
  }

  removeBehindWallChild(element: PIXI.DisplayObject): void {
    this.behindWallPlane.removeChild(element);
  }

  removeContainerChild(element: PIXI.DisplayObject): void {
    this.container.removeChild(element);
  }

  addBehindWallChild(element: PIXI.DisplayObject): void {
    this.behindWallPlane.addChild(element);
  }

  addWallChild(element: PIXI.DisplayObject): void {
    this.wallPlane.addChild(element);
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

  addFloorChild(element: PIXI.DisplayObject): void {
    this.floorPlane.addChild(element);
  }

  addContainerChild(element: PIXI.DisplayObject): void {
    this.container.addChild(element);
  }
}
