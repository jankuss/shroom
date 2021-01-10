import { RoomObject } from "../RoomObject";
import { getZOrder } from "../../util/getZOrder";
import { BaseFurniture } from "./BaseFurniture";
import { IFurniture, IFurnitureBehavior } from "./IFurniture";
import { getMaskId } from "../room/util/getMaskId";
import { FurnitureFetchInfo } from "./FurnitureFetchInfo";
import { getFurnitureFetch } from "./util/getFurnitureFetch";
import { FurnitureId } from "../../interfaces/IFurnitureData";

export class WallFurniture extends RoomObject implements IFurniture {
  public readonly placementType = "wall";

  private _baseFurniture: BaseFurniture;
  private readonly _type: string | undefined;
  private readonly _id: FurnitureId | undefined;
  private _roomX: number;
  private _roomY: number;
  private _roomZ: number;
  private _animation: string | undefined;
  private _direction: number;
  private _highlight = false;

  constructor(
    options: {
      roomX: number;
      roomZ: number;
      roomY: number;
      direction: number;
      animation?: string;
      behaviors?: IFurnitureBehavior<WallFurniture>[];
    } & FurnitureFetchInfo
  ) {
    super();

    this._type = options.type;
    this._id = options.id;

    this._roomX = options.roomX;
    this._roomY = options.roomY;
    this._roomZ = options.roomZ;
    this._animation = options.animation;
    this._direction = options.direction;

    this._baseFurniture = new BaseFurniture({
      animation: this.animation,
      direction: this.direction,
      type: getFurnitureFetch(options, "wall"),
      getMaskId: (direction) => getMaskId(direction, this.roomX, this.roomY),
    });

    options.behaviors?.forEach((behavior) => behavior.setParent(this));
  }

  public get extradata() {
    return this._baseFurniture.extradata;
  }

  public get validDirections() {
    return this._baseFurniture.validDirections;
  }

  public get id() {
    return this._id;
  }

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

  public get animation() {
    return this._animation;
  }

  public set animation(value) {
    this._animation = value;
    this._updateAnimation();
  }

  public get direction() {
    return this._direction;
  }

  public set direction(value) {
    this._direction = value;
    this._updateDirection();
  }

  public get roomX() {
    return this._roomX;
  }

  public set roomX(value) {
    this._roomX = value;
    this._updatePosition();
  }

  public get roomY() {
    return this._roomY;
  }

  public set roomY(value) {
    this._roomY = value;
    this._updatePosition();
  }

  public get roomZ() {
    return this._roomZ;
  }

  public set roomZ(value) {
    this._roomZ = value;
    this._updatePosition();
  }

  public get visualization() {
    return this._baseFurniture.visualization;
  }

  public set visualization(value) {
    this._baseFurniture.visualization = value;
  }

  public get onClick() {
    return this._baseFurniture.onClick;
  }

  public set onClick(value) {
    this._baseFurniture.onClick = value;
  }

  public get onDoubleClick() {
    return this._baseFurniture.onDoubleClick;
  }

  public set onDoubleClick(value) {
    this._baseFurniture.onDoubleClick = value;
  }

  destroyed(): void {
    this._baseFurniture.destroy();
  }

  registered(): void {
    this._baseFurniture.dependencies = {
      animationTicker: this.animationTicker,
      furnitureLoader: this.furnitureLoader,
      hitDetection: this.hitDetection,
      placeholder: undefined,
      visualization: this.roomVisualization,
    };

    this._updatePosition();
  }

  private _updateAnimation() {
    this._baseFurniture.animation = this.animation;
  }

  private _updateDirection() {
    this._baseFurniture.direction = this.direction;
  }

  private _updateHighlight() {
    this._baseFurniture.highlight = this.highlight;
  }

  private _getOffsets(direction: number) {
    if (direction === 2 || direction === 6) return { x: -16, y: -64 };
    if (direction === 4 || direction === 0) return { x: 16, y: -64 };

    throw new Error("Invalid direction for wall item");
  }

  private _updatePosition() {
    const offsets = this._getOffsets(this.direction);
    if (offsets == null) return;

    const base = this.geometry.getPosition(this.roomX, this.roomY, this.roomZ);

    this._baseFurniture.x = base.x + offsets.x;
    this._baseFurniture.y = base.y + offsets.y;
    this._baseFurniture.maskId = (direction) =>
      getMaskId(direction, this.roomX, this.roomY);

    this._baseFurniture.zIndex =
      getZOrder(this.roomX, this.roomZ, this.roomY) - 1;
  }
}
