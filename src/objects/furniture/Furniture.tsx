import * as PIXI from "pixi.js";

import { RoomObject } from "../../RoomObject";
import { getZOrder } from "../../util/getZOrder";
import { BaseFurniture } from "./BaseFurniture";

export class Furniture extends RoomObject {
  private baseFurniture: BaseFurniture;

  constructor(
    type: string,
    direction: number,
    animation: string,
    private position: { roomX: number; roomY: number; roomZ: number }
  ) {
    super();

    this.baseFurniture = new BaseFurniture(type, direction, animation);
  }

  destroy(): void {
    this.baseFurniture.destroy();
  }

  registered(): void {
    const { x, y } = this.geometry.getPosition(
      this.position.roomX,
      this.position.roomY,
      this.position.roomZ
    );

    this.roomObjectContainer.addRoomObject(this.baseFurniture);

    this.baseFurniture.setPosition(x, y);
    this.baseFurniture.setZIndex(
      getZOrder(this.position.roomX, this.position.roomY, this.position.roomZ)
    );
  }
}
