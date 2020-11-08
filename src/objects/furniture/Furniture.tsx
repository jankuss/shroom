import * as PIXI from "pixi.js";

import { RoomObject } from "../../RoomObject";
import { getZOrder } from "../../util/getZOrder";
import { BaseFurniture } from "./BaseFurniture";

export class Furniture extends RoomObject {
  private baseFurniture: BaseFurniture;
  private _roomX: number;
  private _roomY: number;
  private _roomZ: number;
  private _direction: number;
  private _animation?: string;

  constructor(options: {
    roomX: number;
    roomY: number;
    roomZ: number;
    direction: number;
    type: string;
    animation?: string;
  }) {
    super();

    this._roomX = options.roomX;
    this._roomY = options.roomY;
    this._roomZ = options.roomZ;
    this._direction = options.direction;
    this._animation = options.animation;

    this.baseFurniture = new BaseFurniture(
      options.type,
      options.direction,
      options.animation
    );
  }

  get animation() {
    return this._animation;
  }

  set animation(value) {
    this._animation = value;
    this.updateAnimation();
  }

  get direction() {
    return this._direction;
  }

  set direction(value) {
    this._direction = value;
    this.updateDirection();
  }

  get roomX() {
    return this._roomX;
  }

  set roomX(value) {
    this._roomX = value;
    this.updatePosition();
  }

  get roomY() {
    return this._roomY;
  }

  set roomY(value) {
    this._roomY = value;
    this.updatePosition();
  }

  get roomZ() {
    return this._roomZ;
  }

  set roomZ(value) {
    this._roomZ = value;
    this.updatePosition();
  }

  private updateDirection() {
    this.baseFurniture.setDirection(this.direction);
  }

  private updatePosition() {
    const { x, y } = this.geometry.getPosition(
      this.roomX,
      this.roomY,
      this.roomZ
    );

    this.baseFurniture.setPosition(x, y);
    this.baseFurniture.setZIndex(getZOrder(this.roomX, this.roomY, this.roomZ));
  }

  private updateAnimation() {
    this.baseFurniture.setAnimation(this.animation);
  }

  destroy(): void {
    this.baseFurniture.destroy();
  }

  registered(): void {
    this.roomObjectContainer.addRoomObject(this.baseFurniture);
    this.updatePosition();
  }
}
