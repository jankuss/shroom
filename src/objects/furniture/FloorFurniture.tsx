import * as PIXI from 'pixi.js';

import { RoomObject } from '../RoomObject';
import { getZOrder } from '../../util/getZOrder';
import { BaseFurniture } from './BaseFurniture';
import { IFurniture, IFurnitureBehavior } from './IFurniture';
import { ObjectAnimation } from '../../util/animation/ObjectAnimation';
import { HitEventHandler } from '../hitdetection/HitSprite';

export class FloorFurniture extends RoomObject implements IFurniture {
  private baseFurniture: BaseFurniture;
  private movementAnimation: ObjectAnimation | undefined;

  private _roomX: number;
  private _roomY: number;
  private _roomZ: number;
  private _direction: number;
  private _animation?: string;
  private _type: string;

  private _onClick: HitEventHandler | undefined;
  private _onDoubleClick: HitEventHandler | undefined;

  public get type() {
    return this._type;
  }

  public get onClick() {
    return this._onClick;
  }

  public set onClick(value) {
    this._onClick = value;
    this.baseFurniture.onClick = this.onClick;
  }

  public get onDoubleClick() {
    return this._onDoubleClick;
  }

  public set onDoubleClick(value) {
    this._onDoubleClick = value;
    this.baseFurniture.onDoubleClick = this.onDoubleClick;
  }

  constructor(options: {
    roomX: number;
    roomY: number;
    roomZ: number;
    direction: number;

    type: string;
    animation?: string;
    behaviors?: IFurnitureBehavior<FloorFurniture>[];
  }) {
    super();

    this._type = options.type;
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
    this.baseFurniture.direction = this.direction;
  }

  private _updatePosition() {
    const { x, y } = this.geometry.getPosition(
      this.roomX,
      this.roomY,
      this.roomZ,
      'object'
    );

    this.baseFurniture.x = x;
    this.baseFurniture.y = y;
    this.baseFurniture.zIndex = getZOrder(this.roomX, this.roomY, this.roomZ);
  }

  private _updateAnimation() {
    this.baseFurniture.animation = this.animation;
  }

  destroy(): void {
    this.baseFurniture.destroy();
  }

  registered(): void {
    this.roomObjectContainer.addRoomObject(this.baseFurniture);
    this.movementAnimation = new ObjectAnimation(this.animationTicker, {
      onStart: () => {},
      onStop: () => {},
      onUpdatePosition: (position, direction) => {},
    });

    this._updatePosition();
  }
}
