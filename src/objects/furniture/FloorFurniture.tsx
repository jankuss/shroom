import * as PIXI from "pixi.js";

import { RoomObject } from "../RoomObject";
import { getZOrder } from "../../util/getZOrder";
import { BaseFurniture } from "./BaseFurniture";
import { IFurniture, IFurnitureBehavior } from "./IFurniture";
import { ObjectAnimation } from "../../util/animation/ObjectAnimation";
import { HitEventHandler } from "../hitdetection/HitSprite";
import { RoomPosition } from "../../types/RoomPosition";
import { IMoveable } from "../IMoveable";
import { FurnitureFetchInfo } from "./FurnitureFetchInfo";
import { getFurnitureFetch } from "./util/getFurnitureFetch";
import { FurnitureId } from "../../interfaces/IFurnitureData";

export class FloorFurniture
  extends RoomObject
  implements IFurniture, IMoveable {
  private _baseFurniture: BaseFurniture;
  private _moveAnimation: ObjectAnimation<undefined> | undefined;

  private _animatedPosition: RoomPosition = { roomX: 0, roomY: 0, roomZ: 0 };

  private _moving: boolean = false;

  private readonly _id: FurnitureId | undefined;
  private readonly _type: string | undefined;

  private _roomX: number;
  private _roomY: number;
  private _roomZ: number;
  private _direction: number;
  private _animation?: string;
  private _highlight: boolean = false;

  public readonly placementType = "wall";

  private _onClick: HitEventHandler | undefined;
  private _onDoubleClick: HitEventHandler | undefined;

  public get highlight() {
    return this._highlight;
  }

  public set highlight(value) {
    this._highlight = value;
    this._updateHighlight();
  }

  public get alpha() {
    return this._baseFurniture.alpha;
  }

  public set alpha(value: number) {
    this._baseFurniture.alpha = value;
  }

  public get type() {
    return this._type;
  }

  public get onClick() {
    return this._onClick;
  }

  public set onClick(value) {
    this._onClick = value;
    this._baseFurniture.onClick = this.onClick;
  }

  public get onDoubleClick() {
    return this._onDoubleClick;
  }

  public set onDoubleClick(value) {
    this._onDoubleClick = value;
    this._baseFurniture.onDoubleClick = this.onDoubleClick;
  }

  public get id() {
    return this._id;
  }

  constructor(
    options: {
      roomX: number;
      roomY: number;
      roomZ: number;
      direction: number;
      animation?: string;
      behaviors?: IFurnitureBehavior<FloorFurniture>[];
    } & FurnitureFetchInfo
  ) {
    super();

    this._type = options.type;
    this._id = options.id;

    this._roomX = options.roomX;
    this._roomY = options.roomY;
    this._roomZ = options.roomZ;
    this._direction = options.direction;
    this._animation = options.animation;

    if ("type" in options) {
      this._type = options.type;
    }

    this._baseFurniture = new BaseFurniture(
      getFurnitureFetch(options, "floor"),
      options.direction,
      options.animation
    );

    options.behaviors?.forEach((behavior) => behavior.setParent(this));
  }

  get animation() {
    return this._animation;
  }

  set animation(value) {
    this._animation = value;
    this._updateAnimation();
  }

  get direction() {
    return this._direction;
  }

  set direction(value) {
    this._direction = value;
    this._updateDirection();
  }

  get roomX() {
    return this._roomX;
  }

  set roomX(value) {
    this._roomX = value;
    this._updatePosition();
  }

  get roomY() {
    return this._roomY;
  }

  set roomY(value) {
    this._roomY = value;
    this._updatePosition();
  }

  get roomZ() {
    return this._roomZ;
  }

  set roomZ(value) {
    this._roomZ = value;
    this._updatePosition();
  }

  private _updateDirection() {
    this._baseFurniture.direction = this.direction;
  }

  private _getDisplayRoomPosition() {
    if (this._moving) {
      return this._animatedPosition;
    }

    return {
      roomX: this.roomX,
      roomY: this.roomY,
      roomZ: this.roomZ,
    };
  }

  private _updatePosition() {
    const { roomX, roomY, roomZ } = this._getDisplayRoomPosition();

    const { x, y } = this.geometry.getPosition(roomX, roomY, roomZ);

    const roomXrounded = Math.round(roomX);
    const roomYrounded = Math.round(roomY);

    this._baseFurniture.x = x;
    this._baseFurniture.y = y;
    this._baseFurniture.zIndex = getZOrder(
      roomXrounded,
      roomYrounded,
      this.roomZ
    );
  }

  private _updateAnimation() {
    this._baseFurniture.animation = this.animation;
  }

  private _updateHighlight() {
    this._baseFurniture.highlight = this.highlight;
  }

  move(roomX: number, roomY: number, roomZ: number) {
    this._moveAnimation?.move(
      { roomX: this.roomX, roomY: this.roomY, roomZ: this.roomZ },
      { roomX, roomY, roomZ },
      undefined
    );

    this._roomX = roomX;
    this._roomY = roomY;
    this._roomZ = roomZ;
  }

  clearMovement() {
    const current = this._moveAnimation?.clear();

    if (current != null) {
      this.roomX = current.roomX;
      this.roomY = current.roomY;
      this.roomZ = current.roomZ;
    }
  }

  destroyed(): void {
    this._baseFurniture.destroy();
  }

  registered(): void {
    this.roomObjectContainer.addRoomObject(this._baseFurniture);
    this._moveAnimation = new ObjectAnimation(
      this.animationTicker,
      {
        onStart: () => {
          this._moving = true;
        },
        onStop: () => {
          this._moving = false;
        },
        onUpdatePosition: (position, data) => {
          this._animatedPosition = position;
          this._updatePosition();
        },
      },
      this.configuration.furnitureMovementDuration
    );

    this._updatePosition();
  }
}
