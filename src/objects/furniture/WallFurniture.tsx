import * as PIXI from "pixi.js";

import { RoomObject } from "../../RoomObject";
import { getZOrder } from "../../util/getZOrder";
import { BaseFurniture } from "./BaseFurniture";
import { IFurniture } from "./IFurniture";

export class WallFurniture extends RoomObject implements IFurniture {
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

  direction: number = 0;
  animation: string = "0";
  roomX: number = 0;
  roomY: number = 0;
  roomZ: number = 0;

  private getOffsets(direction: number) {
    if (direction === 2) return { x: -16, y: -64 };
    if (direction === 4) return { x: 16, y: -64 };
  }

  destroy(): void {
    this.baseFurniture.destroy();
  }

  registered(): void {
    const offsets = this.getOffsets(this.direction);
    if (offsets == null) return;

    const base = this.geometry.getPosition(
      this.position.roomX,
      this.position.roomY,
      this.position.roomZ
    );

    this.baseFurniture.setPosition(base.x + offsets.x, base.y + offsets.y);
    this.baseFurniture.setZIndex(0);

    this.roomObjectContainer.addRoomObject(this.baseFurniture);
  }
}
