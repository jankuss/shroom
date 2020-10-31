import * as PIXI from "pixi.js";

import { IRoomVisualization } from "../../IRoomVisualization";

export class RoomVisualization
  extends PIXI.Container
  implements IRoomVisualization {
  private container: PIXI.Container = new PIXI.Container();
  private plane: PIXI.Container = new PIXI.Container();

  constructor() {
    super();
    this.container.sortableChildren = true;
    this.plane.cacheAsBitmap = true;

    this.addChild(this.plane);
    this.addChild(this.container);
  }

  addPlaneChild(element: PIXI.DisplayObject): void {
    this.plane.addChild(element);
  }

  addContainerChild(element: PIXI.DisplayObject): void {
    this.container.addChild(element);
  }
}
