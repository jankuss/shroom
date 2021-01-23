import { RoomObject } from "../RoomObject";
import { getZOrder } from "../../util/getZOrder";
import { BaseFurniture } from "./BaseFurniture";
import { IFurniture, IFurnitureBehavior } from "./IFurniture";
import { ObjectAnimation } from "../animation/ObjectAnimation";
import { HitEventHandler } from "../hitdetection/HitSprite";
import { RoomPosition } from "../../types/RoomPosition";
import { IMoveable } from "../interfaces/IMoveable";
import { FurnitureFetchInfo } from "./FurnitureFetchInfo";
import { getFurnitureFetch } from "./util/getFurnitureFetch";
import { FurnitureId } from "../../interfaces/IFurnitureData";

export class FloorFurniture
  extends RoomObject
  implements IFurniture, IMoveable {
  public readonly placementType = "floor";
  private _baseFurniture: BaseFurniture;
  private _moveAnimation: ObjectAnimation<undefined> | undefined;
  private _animatedPosition: RoomPosition = { roomX: 0, roomY: 0, roomZ: 0 };
  private _moving = false;

  private readonly _id: FurnitureId | undefined;
  private readonly _type: string | undefined;

  private _roomX: number;
  private _roomY: number;
  private _roomZ: number;
  private _direction: number;
  private _animation?: string;
  private _highlight = false;

  private _onClick: HitEventHandler | undefined;
  private _onDoubleClick: HitEventHandler | undefined;
  private _onPointerDown: HitEventHandler | undefined;
  private _onPointerUp: HitEventHandler | undefined;

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

    this._baseFurniture = new BaseFurniture({
      animation: this.animation,
      direction: this.direction,
      type: getFurnitureFetch(options, "floor"),
    });

    options.behaviors?.forEach((behavior) => behavior.setParent(this));
  }

  /**
   * Moves and animates the furniture to a new position.
   *
   * @param roomX New x-Position
   * @param roomY New y-Position
   * @param roomZ New z-Position
   */
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

  /**
   * Clears the enqueued movement animations of the furniture
   */
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
    this._baseFurniture.dependencies = {
      animationTicker: this.animationTicker,
      furnitureLoader: this.furnitureLoader,
      hitDetection: this.hitDetection,
      placeholder: this.configuration.placeholder,
      visualization: this.roomVisualization,
    };

    this._moveAnimation = new ObjectAnimation(
      this.animationTicker,
      {
        onStart: () => {
          this._moving = true;
        },
        onStop: () => {
          this._moving = false;
        },
        onUpdatePosition: (position) => {
          this._animatedPosition = position;
          this._updatePosition();
        },
      },
      this.configuration.furnitureMovementDuration
    );

    this._updatePosition();
  }

  /**
   * If set to true, displays the furniture in the highlight state.
   */
  public get highlight() {
    return this._highlight;
  }

  public set highlight(value) {
    this._highlight = value;
    this._updateHighlight();
  }

  /**
   * Alpha value of the furniture
   */
  public get alpha() {
    return this._baseFurniture.alpha;
  }

  public set alpha(value: number) {
    this._baseFurniture.alpha = value;
  }

  /**
   * Type of the furniture
   */
  public get type() {
    return this._type;
  }

  /**
   * Callback triggered when the furniture has been clicked on.
   */
  public get onClick() {
    return this._onClick;
  }

  public set onClick(value) {
    this._onClick = value;
    this._baseFurniture.onClick = this.onClick;
  }

  /**
   * Callback triggered when the furniture has been double clicked on.
   */
  public get onDoubleClick() {
    return this._onDoubleClick;
  }

  public set onDoubleClick(value) {
    this._onDoubleClick = value;
    this._baseFurniture.onDoubleClick = this.onDoubleClick;
  }

  public get onPointerDown() {
    return this._onPointerDown;
  }

  public set onPointerDown(value) {
    this._onPointerDown = value;
    this._baseFurniture.onPointerDown = this.onPointerDown;
  }

  public get onPointerUp() {
    return this._onPointerUp;
  }

  public set onPointerUp(value) {
    this._onPointerUp = value;
    this._baseFurniture.onPointerUp = this.onPointerUp;
  }

  /**
   * ID of the furniture
   */
  public get id() {
    return this._id;
  }

  /**
   * The extra data provided through the `index.bin` file of the furniture.
   * This contains the `logic` and `visualization` stings which specify some
   * furniture behavior.
   */
  public get extradata() {
    return this._baseFurniture.extradata;
  }

  /**
   * Valid directions of the furniture.
   */
  public get validDirections() {
    return this._baseFurniture.validDirections;
  }

  /**
   * Animation of the furniture
   */
  get animation() {
    return this._animation;
  }

  set animation(value) {
    this._animation = value;
    this._updateAnimation();
  }

  /**
   * Direction of the furniture
   */
  get direction() {
    return this._direction;
  }

  set direction(value) {
    this._direction = value;
    this._updateDirection();
  }

  /**
   * The x position of the avatar in the room.
   * The y-Axis is marked in the following graphic:
   *
   * ```
   *    |
   *    |
   *    |
   *   / \
   *  /   \   <- x-Axis
   * /     \
   * ```
   */
  get roomX() {
    return this._roomX;
  }

  set roomX(value) {
    this._roomX = value;
    this._updatePosition();
  }

  /**
   * The y position of the avatar in the room.
   * The y-Axis is marked in the following graphic:
   *
   * ```
   *              |
   *              |
   *              |
   *             / \
   * y-Axis ->  /   \
   *           /     \
   * ```
   */
  get roomY() {
    return this._roomY;
  }

  set roomY(value) {
    this._roomY = value;
    this._updatePosition();
  }

  /**
   * The z position of the avatar in the room.
   * The z-Axis is marked in the following graphic:
   *
   * ```
   *              |
   *   z-Axis ->  |
   *              |
   *             / \
   *            /   \
   *           /     \
   * ```
   */
  get roomZ() {
    return this._roomZ;
  }

  set roomZ(value) {
    this._roomZ = value;
    this._updatePosition();
  }

  public get visualization() {
    return this._baseFurniture.visualization;
  }

  public set visualization(value) {
    this._baseFurniture.visualization = value;
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
}
