import * as PIXI from "pixi.js";
import {
  HitDetectionElement,
  HitDetectionNode,
  HitEvent,
  IHitDetection,
} from "../../../interfaces/IHitDetection";
import { RoomPosition } from "../../../types/RoomPosition";

export class TileCursor extends PIXI.Container implements HitDetectionElement {
  private _roomX: number;
  private _roomY: number;
  private _roomZ: number;
  private _graphics: PIXI.Graphics;
  private _hover = false;
  private _node: HitDetectionNode;

  constructor(
    hitDetection: IHitDetection,
    private _position: RoomPosition,
    private onClick: (position: RoomPosition) => void,
    private onOver: (position: RoomPosition) => void,
    private onOut: (position: RoomPosition) => void
  ) {
    super();
    this._roomX = _position.roomX;
    this._roomY = _position.roomY;
    this._roomZ = _position.roomZ;
    this._graphics = this._createGraphics();
    this._updateGraphics();

    this.addChild(this._graphics);

    this._node = hitDetection.register(this);
  }

  trigger(type: "click", event: HitEvent): void {
    switch (type) {
      case "click":
        this.onClick({
          roomX: this._roomX,
          roomY: this._roomY,
          roomZ: this._roomZ,
        });
        break;
    }
  }

  hits(x: number, y: number): boolean {
    const tx = this.worldTransform.tx;
    const ty = this.worldTransform.ty;

    const diffX = x - tx;
    const diffY = y - ty;

    return this._pointInside(
      [diffX, diffY],
      [
        [points.p1.x, points.p1.y],
        [points.p2.x, points.p2.y],
        [points.p3.x, points.p3.y],
        [points.p4.x, points.p4.y],
      ]
    );
  }

  getHitDetectionZIndex(): number {
    return -1000;
  }

  destroy() {
    super.destroy();

    this._node.remove();
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
    graphics.addListener("mouseover", () => this._updateHover(true));
    graphics.addListener("mouseout", () => this._updateHover(false));

    return graphics;
  }

  private _updateGraphics() {
    const graphics = this._graphics;
    if (graphics == null) return;

    graphics.clear();

    if (this._hover) {
      drawBorder(graphics, 0x000000, 0.33, 0);
      drawBorder(graphics, 0xa7d1e0, 1, -2);
      drawBorder(graphics, 0xffffff, 1, -3);
    }
  }

  private _updateHover(hover: boolean) {
    if (this._hover === hover) return;
    this._hover = hover;
    this._updateGraphics();

    if (hover) {
      this.onOver(this._position);
    } else {
      this.onOut(this._position);
    }
  }

  private _pointInside(point: [number, number], vs: [number, number][]) {
    // ray-casting algorithm based on
    // https://wrf.ecse.rpi.edu/Research/Short_Notes/pnpoly.html/pnpoly.html

    const x = point[0];
    const y = point[1];

    let inside = false;
    for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
      const xi = vs[i][0];
      const yi = vs[i][1];
      const xj = vs[j][0];
      const yj = vs[j][1];

      const intersect =
        yi > y != yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
      if (intersect) inside = !inside;
    }

    return inside;
  }
}

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
