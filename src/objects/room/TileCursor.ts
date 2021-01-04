import * as PIXI from "pixi.js";

import { RoomPosition } from "../../types/RoomPosition";
import { getZOrder } from "../../util/getZOrder";
import { RoomObject } from "../RoomObject";

const points = {
  p1: { x: 0, y: 16 },
  p2: { x: 32, y: 0 },
  p3: { x: 64, y: 16 },
  p4: { x: 32, y: 32 },
};

function drawBorder(
  graphics: PIXI.Graphics,
  color: number,
  alpha = 1,
  offsetY: number
) {
  graphics.beginFill(color, alpha);
  graphics.moveTo(points.p1.x, points.p1.y + offsetY);
  graphics.lineTo(points.p2.x, points.p2.y + offsetY);
  graphics.lineTo(points.p3.x, points.p3.y + offsetY);
  graphics.lineTo(points.p4.x, points.p4.y + offsetY);
  graphics.endFill();

  graphics.beginHole();
  graphics.moveTo(points.p1.x + 6, points.p1.y + offsetY);
  graphics.lineTo(points.p2.x, points.p2.y + 3 + offsetY);
  graphics.lineTo(points.p3.x - 6, points.p3.y + offsetY);
  graphics.lineTo(points.p4.x, points.p4.y - 3 + offsetY);
  graphics.endHole();
}

export class TileCursor extends RoomObject {
  private _roomX: number;
  private _roomY: number;
  private _roomZ: number;
  private graphics: PIXI.Graphics | undefined;
  private hover = false;

  constructor(
    private position: RoomPosition,
    private door: boolean,
    private onClick: (position: RoomPosition) => void,
    private onOver: (position: RoomPosition) => void,
    private onOut: (position: RoomPosition) => void
  ) {
    super();
    this._roomX = position.roomX;
    this._roomY = position.roomY;
    this._roomZ = position.roomZ;
  }

  destroyed(): void {
    this.graphics?.destroy();
  }

  private _createGraphics() {
    const graphics = new PIXI.Graphics();

    graphics.hitArea = new PIXI.Polygon([
      new PIXI.Point(points.p1.x, points.p1.y),
      new PIXI.Point(points.p2.x, points.p2.y),
      new PIXI.Point(points.p3.x, points.p3.y),
      new PIXI.Point(points.p4.x, points.p4.y),
    ]);
    graphics.interactive = true;
    graphics.addListener("mouseover", () => this.updateHover(true));
    graphics.addListener("mouseout", () => this.updateHover(false));
    graphics.addListener("click", () => {
      this.onClick(this.position);
    });

    return graphics;
  }

  private updateGraphics() {
    const graphics = this.graphics;
    if (graphics == null) return;

    graphics.clear();

    const { x, y } = this.geometry.getPosition(
      this._roomX,
      this._roomY,
      this._roomZ
    );

    graphics.zIndex = this.door
      ? 0
      : getZOrder(this._roomX, this._roomY, this._roomZ) - 1;
    graphics.x = x;
    graphics.y = y;

    if (this.hover) {
      drawBorder(graphics, 0x000000, 0.33, 0);
      drawBorder(graphics, 0xa7d1e0, 1, -2);
      drawBorder(graphics, 0xffffff, 1, -3);
    }
  }

  registered(): void {
    this.graphics = this._createGraphics();

    if (this.door) {
      this.visualization.behindWallContainer.addChild(this.graphics);
    } else {
      this.visualization.container.addChild(this.graphics);
    }
    this.updateGraphics();
  }

  private updateHover(hover: boolean) {
    if (this.hover === hover) return;
    this.hover = hover;
    this.updateGraphics();

    if (hover) {
      this.onOver(this.position);
    } else {
      this.onOut(this.position);
    }
  }
}
