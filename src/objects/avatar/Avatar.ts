import { RoomObject } from "../RoomObject";
import { getZOrder } from "../../util/getZOrder";
import { BaseAvatar } from "./BaseAvatar";
import { LookOptions } from "./util/createLookServer";
import { ObjectAnimation } from "../animation/ObjectAnimation";
import { RoomPosition } from "../../types/RoomPosition";
import { IMoveable } from "../interfaces/IMoveable";
import { AvatarAction } from "./enum/AvatarAction";
import { IScreenPositioned } from "../interfaces/IScreenPositioned";
import { HitEventHandler } from "../hitdetection/HitSprite";

export class Avatar extends RoomObject implements IMoveable, IScreenPositioned {
  private _avatarSprites: BaseAvatar;

  private _moveAnimation:
    | ObjectAnimation<
        | { type: "walk"; direction?: number; headDirection?: number }
        | { type: "move" }
      >
    | undefined;
  private _walking = false;
  private _moving = false;

  private _frame = 0;

  private _cancelAnimation: (() => void) | undefined;

  private _waving = false;
  private _direction = 0;
  private _headDirection?: number;
  private _item: string | number | undefined;
  private _look: string;
  private _roomX = 0;
  private _roomY = 0;
  private _roomZ = 0;
  private _animatedPosition: RoomPosition = { roomX: 0, roomY: 0, roomZ: 0 };
  private _actions: Set<AvatarAction> = new Set();
  private _fx: { type: "dance"; id: string } | undefined;
  private _loadingAvatarSprites: BaseAvatar;
  private _placeholderSprites: BaseAvatar | undefined;
  private _loaded = false;

  private _onClick: HitEventHandler | undefined = undefined;
  private _onDoubleClick: HitEventHandler | undefined = undefined;
  private _onPointerDown: HitEventHandler | undefined = undefined;
  private _onPointerUp: HitEventHandler | undefined = undefined;

  constructor({
    look,
    roomX,
    roomY,
    roomZ,
    direction,
    headDirection,
  }: Options) {
    super();

    this._direction = direction;
    this._look = look;
    this._roomX = roomX;
    this._roomY = roomY;
    this._roomZ = roomZ;
    this._headDirection = headDirection;

    this._placeholderSprites = new BaseAvatar({
      look: this._getPlaceholderLookOptions(),
      zIndex: this._calculateZIndex(),
      position: { x: 0, y: 0 },
      onLoad: () => {
        this._updateAvatarSprites();
      },
    });

    this._placeholderSprites.alpha = 0.5;

    this._avatarSprites = this._placeholderSprites;

    this._loadingAvatarSprites = new BaseAvatar({
      look: this._getLookOptions(),
      position: { x: 0, y: 0 },
      zIndex: this._calculateZIndex(),
      onLoad: () => {
        this._loaded = true;
        this._updateAvatarSprites();
      },
    });
  }

  /**
   * The look of the avatar
   */
  public get look() {
    return this._look;
  }

  /**
   * Set this with a callback if you want to capture clicks on the Avatar.
   */
  public get onClick() {
    return this._onClick;
  }

  public set onClick(value) {
    this._onClick = value;
    this._updateEventHandlers();
  }

  /**
   * Set this with a callback if you want to capture double clicks on the Avatar.
   */
  public get onDoubleClick() {
    return this._onDoubleClick;
  }

  public set onDoubleClick(value) {
    this._onDoubleClick = value;
    this._updateEventHandlers();
  }

  get onPointerDown() {
    return this._onPointerDown;
  }

  set onPointerDown(value) {
    this._onPointerDown = value;
    this._updateEventHandlers();
  }

  get onPointerUp() {
    return this._onPointerUp;
  }

  set onPointerUp(value) {
    this._onPointerUp = value;
    this._updateEventHandlers();
  }

  public get dance() {
    if (this._fx?.type === "dance") {
      return this._fx.id;
    }
  }

  public set dance(value) {
    if (this._fx == undefined || this._fx.type === "dance") {
      if (value == null) {
        this._fx = undefined;
      } else {
        this._fx = { type: "dance", id: value };
      }

      this._updateAvatarSprites();
    }
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

  /**
   * Sets the item of the user. Note that this won't have an effect if you don't supply
   * an action which supports items. These are usually `CarryItem` and `UseItem`.
   */
  get item() {
    return this._item;
  }

  set item(value) {
    this._item = value;
    this._updateAvatarSprites();
  }

  /**
   * Sets the direction of the avatar. Following numbers map to the
   * following directions of the avatar:
   *
   * ```
   *              x-Axis
   *          x--------------
   *          |
   *          |   7  0  1
   *          |
   *  y-Axis  |   6  x  2
   *          |
   *          |   5  4  3
   *
   * ```
   */
  get direction() {
    return this._direction;
  }

  set direction(value) {
    this._direction = value;
    this._updateAvatarSprites();
  }

  get headDirection() {
    return this._headDirection;
  }

  set headDirection(value) {
    this._headDirection = value;
    this._updateAvatarSprites();
  }

  /**
   * If set to true, the avatar will be waving. You can
   * achieve the same behavior by adding the wave action manually
   * through `addAction`.
   */
  get waving() {
    return this._waving;
  }

  set waving(value) {
    this._waving = value;
    this._updateAvatarSprites();
  }

  /**
   * The active actions of the avatar.
   */
  get actions() {
    return this._actions;
  }

  set actions(value) {
    this._actions = value;
    this._updateAvatarSprites();
  }

  /**
   * The apparent position of the avatar on the screen. This is useful
   * for placing UI relative to the user.
   */
  get screenPosition() {
    const worldTransform = this._avatarSprites.worldTransform;
    if (worldTransform == null) return;

    return {
      x: worldTransform.tx,
      y: worldTransform.ty,
    };
  }

  /**
   * Clears the enqueued movement of the avatar.
   */
  clearMovement() {
    const current = this._moveAnimation?.clear();

    if (current != null) {
      this.roomX = current.roomX;
      this.roomY = current.roomY;
      this.roomZ = current.roomZ;
    }
  }

  /**
   * Walk the user to a position. This will trigger the walking animation, change the direction
   * and smoothly move the user to its new position. Note that you have to implement
   * your own pathfinding logic on top of it.
   *
   * @param roomX New x-Position
   * @param roomY New y-Position
   * @param roomZ New z-Position
   * @param options Optionally specify the direction/headDirection of user movement
   */
  walk(
    roomX: number,
    roomY: number,
    roomZ: number,
    options?: { direction?: number; headDirection?: number }
  ) {
    this._moveAnimation?.move(
      { roomX: this.roomX, roomY: this.roomY, roomZ: this.roomZ },
      { roomX, roomY, roomZ },
      {
        direction: options?.direction,
        headDirection: options?.headDirection,
        type: "walk",
      }
    );

    this._roomX = roomX;
    this._roomY = roomY;
    this._roomZ = roomZ;
  }

  /**
   * Move the user to a new position. This will smoothly animate the user to the
   * specified position.
   *
   * @param roomX New x-Position
   * @param roomY New y-Position
   * @param roomZ New z-Position
   */
  move(roomX: number, roomY: number, roomZ: number) {
    this._moveAnimation?.move(
      { roomX: this.roomX, roomY: this.roomY, roomZ: this.roomZ },
      { roomX, roomY, roomZ },
      { type: "move" }
    );

    this._roomX = roomX;
    this._roomY = roomY;
    this._roomZ = roomZ;
  }

  /**
   * @deprecated Use `screenPosition` instead. This will be the actual position on the screen.
   */
  getScreenPosition() {
    return {
      x: this._avatarSprites.x,
      y: this._avatarSprites.y,
    };
  }

  registered(): void {
    if (this._placeholderSprites != null) {
      this._placeholderSprites.dependencies = {
        animationTicker: this.animationTicker,
        avatarLoader: this.avatarLoader,
        hitDetection: this.hitDetection,
      };
    }

    this._loadingAvatarSprites.dependencies = {
      animationTicker: this.animationTicker,
      avatarLoader: this.avatarLoader,
      hitDetection: this.hitDetection,
    };

    this._updateAvatarSprites();

    this._moveAnimation = new ObjectAnimation(
      this.animationTicker,
      {
        onUpdatePosition: (position) => {
          this._animatedPosition = position;
          this._updatePosition();
        },
        onStart: (data) => {
          if (data.type === "walk") {
            this._startWalking(data.direction, data.headDirection);
            this._moving = false;
          } else if (data.type === "move") {
            this._stopWalking();
            this._moving = true;
          }
        },
        onStop: () => {
          this._stopWalking();
          this._moving = false;
        },
      },
      this.configuration.avatarMovementDuration
    );
  }

  /**
   * Make an action active.
   * @param action The action to add
   */
  addAction(action: AvatarAction) {
    this.actions = new Set(this._actions).add(action);
  }

  /**
   * Remove an action from the active actions.
   * @param action The action to remove
   */
  removeAction(action: AvatarAction) {
    const newSet = new Set(this._actions);
    newSet.delete(action);

    this.actions = newSet;
  }

  /**
   * Check if an action is active.
   * @param action The action to check
   */
  hasAction(action: AvatarAction) {
    return this.actions.has(action);
  }

  destroyed(): void {
    this._avatarSprites?.destroy();

    if (this._cancelAnimation != null) {
      this._cancelAnimation();
    }
  }

  private _updateEventHandlers() {
    if (this._placeholderSprites != null) {
      this._placeholderSprites.onClick = this._onClick;
      this._placeholderSprites.onDoubleClick = this._onDoubleClick;
      this._placeholderSprites.onPointerDown = this._onPointerDown;
      this._placeholderSprites.onPointerUp = this._onPointerUp;
    }

    this._loadingAvatarSprites.onClick = this._onClick;
    this._loadingAvatarSprites.onDoubleClick = this._onDoubleClick;
    this._loadingAvatarSprites.onPointerDown = this._onPointerDown;
    this._loadingAvatarSprites.onPointerUp = this._onPointerUp;
  }

  private _getPlaceholderLookOptions(): LookOptions {
    return {
      actions: new Set(),
      direction: this.direction,
      headDirection: this.direction,
      look: "hd-99999-99999",
      effect: undefined,
      initial: false,
      item: undefined,
    };
  }

  private _getCurrentLookOptions(): LookOptions {
    if (!this._loaded) return this._getPlaceholderLookOptions();

    return this._getLookOptions();
  }

  private _getLookOptions(): LookOptions {
    const combinedActions = new Set(this.actions);

    if (this._walking) {
      combinedActions.add(AvatarAction.Move);
    }

    if (this.waving) {
      combinedActions.add(AvatarAction.Wave);
    }

    if (combinedActions.has(AvatarAction.Lay) && this._walking) {
      combinedActions.delete(AvatarAction.Lay);
    }

    return {
      actions: combinedActions,
      direction: this.direction,
      headDirection: this.headDirection,
      look: this._look,
      item: this.item,
      effect: this._fx,
    };
  }

  private _updateAvatarSprites() {
    if (!this.mounted) return;

    if (this._loaded) {
      if (this._placeholderSprites != null) {
        this._placeholderSprites.destroy();
      }

      this._placeholderSprites = undefined;

      this._avatarSprites = this._loadingAvatarSprites;
    } else if (this._placeholderSprites != null) {
      this._avatarSprites = this._placeholderSprites;
    }

    const look = this._getCurrentLookOptions();
    const animating = true;

    if (animating) {
      this._startAnimation();
    } else {
      this._stopAnimation();
    }

    const avatarSprites = this._avatarSprites;

    if (avatarSprites != null) {
      avatarSprites.lookOptions = look;
    }

    this._updatePosition();
    this._updateEventHandlers();
  }

  private _updateFrame() {
    this._avatarSprites.currentFrame = this._frame;
  }

  private _startAnimation() {
    if (this._cancelAnimation != null) return;

    this._frame = 0;
    const start = this.animationTicker.current();

    this._cancelAnimation = this.animationTicker.subscribe((value) => {
      this._frame = value - start;
      this._updateFrame();
    });
  }

  private _stopAnimation() {
    this._frame = 0;
    if (this._cancelAnimation != null) {
      this._cancelAnimation();
      this._cancelAnimation = undefined;
    }
  }

  private _startWalking(direction?: number, headDirection?: number) {
    this._walking = true;

    if (direction != null) {
      this.direction = direction;
    }

    if (headDirection != null) {
      this.headDirection = headDirection;
    }

    this._updateAvatarSprites();
  }

  private _stopWalking() {
    this._walking = false;
    this._updateAvatarSprites();
  }

  private _calculateZIndex() {
    return this._getZIndexAtPosition(this.roomX, this.roomY, this.roomZ);
  }

  private _getDisplayRoomPosition() {
    if (this._walking || this._moving) {
      return this._animatedPosition;
    }

    return {
      roomX: this.roomX,
      roomY: this.roomY,
      roomZ: this.roomZ,
    };
  }

  private _getZIndexAtPosition(roomX: number, roomY: number, roomZ: number) {
    let zOffset = 1;
    if (this._getCurrentLookOptions().actions.has(AvatarAction.Lay)) {
      zOffset += 2000;
    }

    return getZOrder(roomX, roomY, roomZ) + zOffset;
  }

  private _updatePosition() {
    if (!this.mounted) return;

    const { roomX, roomY, roomZ } = this._getDisplayRoomPosition();

    const { x, y } = this.geometry.getPosition(roomX, roomY, roomZ);

    const roomXrounded = Math.round(roomX);
    const roomYrounded = Math.round(roomY);

    if (this._avatarSprites != null) {
      this._avatarSprites.x = Math.round(x);
      this._avatarSprites.y = Math.round(y);

      const zIndex = this._getZIndexAtPosition(
        roomXrounded,
        roomYrounded,
        this.roomZ
      );

      this._avatarSprites.zIndex = zIndex;
      this._avatarSprites.spritesZIndex = zIndex;
    }

    const item = this.tilemap.getTileAtPosition(roomXrounded, roomYrounded);
    if (item?.type === "door") {
      this.roomVisualization.container.removeChild(this._avatarSprites);
      this.roomVisualization.behindWallContainer.addChild(this._avatarSprites);
    }

    if (item == null || item.type !== "door") {
      this.roomVisualization.behindWallContainer.removeChild(
        this._avatarSprites
      );
      this.roomVisualization.container.addChild(this._avatarSprites);
    }
  }
}

interface Options extends RoomPosition {
  /** Look of the avatar */
  look: string;
  /**
   * Direction of the avatar. Following numbers map to the
   * following directions of the avatar. The `x` would be the location of the
   * avatar and the numbers represent for which number the avatar faces in which direction.
   *
   * ```
   *              x-Axis
   *          x--------------
   *          |
   *          |   7  0  1
   *          |
   *  y-Axis  |   6  x  2
   *          |
   *          |   5  4  3
   *
   * ```
   */
  direction: number;
  headDirection?: number;
}
