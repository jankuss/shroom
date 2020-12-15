import * as PIXI from "pixi.js";

import { RoomObject } from "../RoomObject";
import {
  PrimaryAction,
  PrimaryActionKind,
} from "./util/getAvatarDrawDefinition";
import { getZOrder } from "../../util/getZOrder";
import { AvatarSprites } from "./AvatarSprites";
import { avatarFramesObject } from "./util/avatarFrames";
import { LookOptions } from "./util/createLookServer";
import { ObjectAnimation } from "../../util/animation/ObjectAnimation";
import { RoomPosition } from "../../types/RoomPosition";
import { ParsedTileType } from "../../util/parseTileMap";

interface Options {
  look: string;
  direction: number;
  roomX: number;
  roomY: number;
  roomZ: number;
}

export class Avatar extends RoomObject {
  private avatarSprites: AvatarSprites;
  private walkAnimation: ObjectAnimation | undefined;
  private walking: boolean = false;

  private frame: number = 0;

  private cancelAnimation: (() => void) | undefined;

  private _primaryAction: PrimaryActionKind = "std";
  private _waving: boolean = false;
  private _direction: number = 0;
  private _item: number | undefined;
  private _drinking: boolean = false;
  private _look: string;
  private _roomX: number = 0;
  private _roomY: number = 0;
  private _roomZ: number = 0;
  private _animatedPosition: RoomPosition = { roomX: 0, roomY: 0, roomZ: 0 };

  public get onClick() {
    return this.avatarSprites.onClick;
  }

  public set onClick(value) {
    this.avatarSprites.onClick = value;
  }

  public get onDoubleClick() {
    return this.avatarSprites.onDoubleClick;
  }

  public set onDoubleClick(value) {
    this.avatarSprites.onDoubleClick = value;
  }

  constructor({ look, roomX, roomY, roomZ, direction }: Options) {
    super();

    this._direction = direction;
    this._look = look;
    this._roomX = roomX;
    this._roomY = roomY;
    this._roomZ = roomZ;

    this.avatarSprites = new AvatarSprites({
      look: this.getCurrentLookOptions(),
      zIndex: this.calculateZIndex(),
      position: { x: 0, y: 0 },
    });
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

  get item() {
    return this._item;
  }

  set item(value) {
    this._item = value;
    this.updateAvatarSprites();
  }

  get drinking() {
    return this._drinking;
  }

  set drinking(value) {
    this._drinking = value;
    this.updateAvatarSprites();
  }

  get direction() {
    return this._direction;
  }

  set direction(value) {
    this._direction = value;
    this.updatePosition();
    this.updateAvatarSprites();
  }

  get action() {
    return this._primaryAction;
  }

  set action(value) {
    this._primaryAction = value;
    this.updateAvatarSprites();
  }

  get waving() {
    return this._waving;
  }

  set waving(value) {
    this._waving = value;
    this.updateAvatarSprites();
  }

  clearWalk() {
    const current = this.walkAnimation?.clear();

    if (current != null) {
      this.roomX = current.roomX;
      this.roomY = current.roomY;
      this.roomZ = current.roomZ;
    }
  }

  private getWavingAction() {
    if (this.waving) {
      return {
        frame:
          avatarFramesObject.wav[this.frame % avatarFramesObject.wav.length],
      };
    }
  }

  private getDrinkingAction() {
    if (this.item != null) {
      return {
        kind: this.drinking ? ("drk" as const) : ("crr" as const),
        item: this.item,
      };
    }
  }

  private getCurrentPrimaryAction(): PrimaryAction {
    const walkFrame =
      avatarFramesObject.wlk[this.frame % avatarFramesObject.wlk.length];

    if (this.walking || this.action === "wlk") {
      return {
        kind: "wlk",
        frame: walkFrame,
      };
    }

    return {
      kind: this.action,
    };
  }

  private getCurrentLookOptions(): LookOptions {
    return {
      action: this.getCurrentPrimaryAction(),
      actions: {
        wav: this.getWavingAction(),
        item: this.getDrinkingAction(),
      },
      direction: this.direction,
      look: this._look,
    };
  }

  private updateAvatarSprites() {
    if (!this.mounted) return;

    const look = this.getCurrentLookOptions();
    const animating = this.isAnimating(look);

    if (animating) {
      this.startAnimation();
    } else {
      this.stopAnimation();
    }

    const avatarSprites = this.avatarSprites;

    if (avatarSprites != null) {
      avatarSprites.lookOptions = look;
    }
  }

  private startAnimation() {
    if (this.cancelAnimation != null) return;

    this.frame = 0;
    const start = this.animationTicker.current();

    this.cancelAnimation = this.animationTicker.subscribe((value) => {
      this.frame = value - start;
      this.updateAvatarSprites();
    });
  }

  private stopAnimation() {
    this.frame = 0;
    if (this.cancelAnimation != null) {
      this.cancelAnimation();
      this.cancelAnimation = undefined;
    }
  }

  private startWalking(direction: number) {
    this.walking = true;
    this.direction = direction;
    this.updateAvatarSprites();
  }

  private stopWalking() {
    this.walking = false;
    this.updateAvatarSprites();
  }

  private isAnimating(look: LookOptions) {
    if (look.action.kind === "wlk") return true;
    if (look.actions.wav != null) return true;

    return false;
  }

  walk(
    roomX: number,
    roomY: number,
    roomZ: number,
    options?: { direction?: number }
  ) {
    this.walkAnimation?.move(
      { roomX: this.roomX, roomY: this.roomY, roomZ: this.roomZ },
      { roomX, roomY, roomZ },
      options?.direction ?? this.direction
    );

    this._roomX = roomX;
    this._roomY = roomY;
    this._roomZ = roomZ;
  }

  private calculateZIndex() {
    return this._getZIndexAtPosition(this.roomX, this.roomY, this.roomZ);
  }

  private getDisplayRoomPosition() {
    if (this.walking) {
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

  private updatePosition() {
    if (!this.mounted) return;

    const { roomX, roomY, roomZ } = this.getDisplayRoomPosition();

    const { x, y } = this.geometry.getPosition(roomX, roomY, roomZ, "object");

    const roomXrounded = Math.round(roomX);
    const roomYrounded = Math.round(roomY);
    const roomZrounded = Math.round(roomZ);

    if (this.avatarSprites != null) {
      this.avatarSprites.x = Math.round(x);
      this.avatarSprites.y = Math.round(y);
      this.avatarSprites.zIndex = this._getZIndexAtPosition(
        roomXrounded,
        roomYrounded,
        roomZrounded
      );
    }

    const item = this.tilemap.getTileAtPosition(roomXrounded, roomYrounded);

    this.avatarSprites.layer = item?.type === "door" ? "door" : "tile";
  }

  registered(): void {
    this.updatePosition();
    this.roomObjectContainer.addRoomObject(this.avatarSprites);

    this.walkAnimation = new ObjectAnimation(this.animationTicker, {
      onUpdatePosition: (position, direction) => {
        this._animatedPosition = position;
        this.updatePosition();
      },
      onStart: (direction: number) => {
        this.startWalking(direction);
      },
      onStop: () => {
        this.stopWalking();
      },
    });

    this.updateAvatarSprites();
  }

  destroyed(): void {
    this.avatarSprites?.destroy();

    if (this.cancelAnimation != null) {
      this.cancelAnimation();
    }
  }
}
