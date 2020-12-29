import * as PIXI from "pixi.js";

import { RoomObject } from "../RoomObject";
import { getZOrder } from "../../util/getZOrder";
import { AvatarSprites } from "./AvatarSprites";
import { LookOptions } from "./util/createLookServer";
import { ObjectAnimation } from "../../util/animation/ObjectAnimation";
import { RoomPosition } from "../../types/RoomPosition";
import { IMoveable } from "../IMoveable";
import { AvatarAction } from "./enum/AvatarAction";
import { IRoomPositioned, RoomObjectRect } from "../room/IRoomPositioned";

interface Options {
  look: string;
  direction: number;
  roomX: number;
  roomY: number;
  roomZ: number;
}

export class Avatar extends RoomObject implements IMoveable, IRoomPositioned {
  private _avatarSprites: AvatarSprites;
  private _moveAnimation:
    | ObjectAnimation<{ type: "walk"; direction: number } | { type: "move" }>
    | undefined;
  private _walking: boolean = false;
  private _moving: boolean = false;

  private _frame: number = 0;

  private _cancelAnimation: (() => void) | undefined;

  private _waving: boolean = false;
  private _direction: number = 0;
  private _item: string | number | undefined;
  private _drinking: boolean = false;
  private _look: string;
  private _roomX: number = 0;
  private _roomY: number = 0;
  private _roomZ: number = 0;
  private _animatedPosition: RoomPosition = { roomX: 0, roomY: 0, roomZ: 0 };
  private _actions: Set<AvatarAction> = new Set();
  private _fx: { type: "dance"; id: string } | undefined;

  public get onClick() {
    return this._avatarSprites.onClick;
  }

  public set onClick(value) {
    this._avatarSprites.onClick = value;
  }

  public get onDoubleClick() {
    return this._avatarSprites.onDoubleClick;
  }

  public set onDoubleClick(value) {
    this._avatarSprites.onDoubleClick = value;
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

  constructor({ look, roomX, roomY, roomZ, direction }: Options) {
    super();

    this._direction = direction;
    this._look = look;
    this._roomX = roomX;
    this._roomY = roomY;
    this._roomZ = roomZ;

    this._avatarSprites = new AvatarSprites({
      look: this._getCurrentLookOptions(),
      zIndex: this._calculateZIndex(),
      position: { x: 0, y: 0 },
    });
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

  get item() {
    return this._item;
  }

  set item(value) {
    this._item = value;
    this._updateAvatarSprites();
  }

  get drinking() {
    return this._drinking;
  }

  set drinking(value) {
    this._drinking = value;
    this._updateAvatarSprites();
  }

  get direction() {
    return this._direction;
  }

  set direction(value) {
    this._direction = value;
    this._updatePosition();
    this._updateAvatarSprites();
  }

  get waving() {
    return this._waving;
  }

  set waving(value) {
    this._waving = value;
    this._updateAvatarSprites();
  }

  get actions() {
    return this._actions;
  }

  set actions(value) {
    this._actions = value;
    this._updateAvatarSprites();
  }

  getRoomObjectRect(): RoomObjectRect {
    return {
      x: this._avatarSprites.x,
      y: this._avatarSprites.y,
      width: 64,
      height: 0,
    };
  }

  clearMovement() {
    const current = this._moveAnimation?.clear();

    if (current != null) {
      this.roomX = current.roomX;
      this.roomY = current.roomY;
      this.roomZ = current.roomZ;
    }
  }

  private _getCurrentLookOptions(): LookOptions {
    const combinedActions = new Set(this.actions);

    if (this._walking) {
      combinedActions.add(AvatarAction.Move);
    }

    if (this.waving) {
      combinedActions.add(AvatarAction.Wave);
    }

    return {
      actions: combinedActions,
      direction: this.direction,
      look: this._look,
      item: this.item,
      effect: this._fx,
    };
  }

  private _updateAvatarSprites() {
    if (!this.mounted) return;

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

  private _startWalking(direction: number) {
    this._walking = true;
    this.direction = direction;
    this._updateAvatarSprites();
  }

  private _stopWalking() {
    this._walking = false;
    this._updateAvatarSprites();
  }

  walk(
    roomX: number,
    roomY: number,
    roomZ: number,
    options?: { direction?: number }
  ) {
    this._moveAnimation?.move(
      { roomX: this.roomX, roomY: this.roomY, roomZ: this.roomZ },
      { roomX, roomY, roomZ },
      {
        direction: options?.direction ?? this.direction,
        type: "walk",
      }
    );

    this._roomX = roomX;
    this._roomY = roomY;
    this._roomZ = roomZ;
  }

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
    return getZOrder(roomX, roomY, roomZ) + 1;
  }

  /**
   * @deprecated Use `getRoomObjectRect()`
   */
  getScreenPosition() {
    return this.getRoomObjectRect();
  }

  private _updatePosition() {
    if (!this.mounted) return;

    const { roomX, roomY, roomZ } = this._getDisplayRoomPosition();

    const { x, y } = this.geometry.getPosition(roomX, roomY, roomZ);

    const roomXrounded = Math.round(roomX);
    const roomYrounded = Math.round(roomY);
    const roomZrounded = Math.round(roomZ);

    if (this._avatarSprites != null) {
      this._avatarSprites.x = Math.round(x);
      this._avatarSprites.y = Math.round(y);
      this._avatarSprites.zIndex = this._getZIndexAtPosition(
        roomXrounded,
        roomYrounded,
        this.roomZ
      );
    }

    const item = this.tilemap.getTileAtPosition(roomXrounded, roomYrounded);

    this._avatarSprites.layer = item?.type === "door" ? "door" : "tile";
  }

  registered(): void {
    this._updatePosition();

    this._updateAvatarSprites();

    this.roomObjectContainer.addRoomObject(this._avatarSprites);

    this._moveAnimation = new ObjectAnimation(
      this.animationTicker,
      {
        onUpdatePosition: (position, data) => {
          this._animatedPosition = position;
          this._updatePosition();
        },
        onStart: (data) => {
          if (data.type === "walk") {
            this._startWalking(data.direction);
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

  addAction(action: AvatarAction) {
    this.actions = new Set(this._actions).add(action);
  }

  removeAction(action: AvatarAction) {
    const newSet = new Set(this._actions);
    newSet.delete(action);

    this.actions = newSet;
  }

  hasAction(action: AvatarAction) {
    return this.actions.has(action);
  }

  destroyed(): void {
    this._avatarSprites?.destroy();

    if (this._cancelAnimation != null) {
      this._cancelAnimation();
    }
  }
}
