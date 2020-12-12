import * as PIXI from "pixi.js";

import { RoomObject } from "../RoomObject";
import { getZOrder } from "../../util/getZOrder";
import { BaseFurniture } from "./BaseFurniture";
import { IFurniture, IFurnitureBehavior } from "./IFurniture";
import { HitEvent } from "../../interfaces/IHitDetection";

export class WallFurniture extends RoomObject implements IFurniture {
  private baseFurniture: BaseFurniture;
  private _type: string;
  private _roomX: number;
  private _roomY: number;
  private _roomZ: number;
  private _animation: string | undefined;
  private _direction: number;

  constructor(options: {
    roomX: number;
    roomZ: number;
    roomY: number;
    type: string;
    direction: number;
    animation?: string;
    behaviors?: IFurnitureBehavior<WallFurniture>[];
  }) {
    super();

    this._type = options.type;

    this._roomX = options.roomX;
    this._roomY = options.roomY;
    this._roomZ = options.roomZ;
    this._animation = options.animation;
    this._direction = options.direction;

    this.baseFurniture = new BaseFurniture(
      options.type,
      options.direction,
      options.animation,
      { roomX: this.roomX, roomY: this.roomY }
    );

    options.behaviors?.forEach((behavior) => behavior.setParent(this));
  }

  public get type() {
    return this._type;
  }

  public get animation() {
    return this._animation;
  }

  public set animation(value) {
    this._animation = value;
    this.updateAnimation();
  }

  public get direction() {
    return this._direction;
  }

  public set direction(value) {
    this._direction = value;
    this.updateDirection();
  }

  public get roomX() {
    return this._roomX;
  }

  public set roomX(value) {
    this._roomX = value;
    this.updatePosition();
  }

  public get roomY() {
    return this._roomY;
  }

  public set roomY(value) {
    this._roomY = value;
    this.updatePosition();
  }

  public get roomZ() {
    return this._roomZ;
  }

  public set roomZ(value) {
    this._roomZ = value;
    this.updatePosition();
  }

  public get onClick() {
    return this.baseFurniture.onClick;
  }

  public set onClick(value) {
    this.baseFurniture.onClick = value;
  }

  public get onDoubleClick() {
    return this.baseFurniture.onDoubleClick;
  }

  public set onDoubleClick(value) {
    this.baseFurniture.onDoubleClick = value;
  }

  private updateAnimation() {
    this.baseFurniture.animation = this.animation;
  }

  private updateDirection() {
    this.baseFurniture.direction = this.direction;
  }

  private getOffsets(direction: number) {
    if (direction === 2 || direction === 6) return { x: -16, y: -64 };
    if (direction === 4 || direction === 0) return { x: 16, y: -64 };

    throw new Error("Invalid direction for wall item");
  }

  destroy(): void {
    this.baseFurniture.destroy();
  }

  private updatePosition() {
    const offsets = this.getOffsets(this.direction);
    if (offsets == null) return;

    const base = this.geometry.getPosition(
      this.roomX,
      this.roomY,
      this.roomZ,
      "object"
    );

    this.baseFurniture.x = base.x + offsets.x;
    this.baseFurniture.y = base.y + offsets.y;
    this.baseFurniture.maskLevel = this.geometry.getMaskLevel(
      this.roomX,
      this.roomY
    );

    this.baseFurniture.zIndex =
      getZOrder(this.roomX, this.roomZ, this.roomY) - 1;
  }

  registered(): void {
    this.updatePosition();
    this.roomObjectContainer.addRoomObject(this.baseFurniture);
  }
}
