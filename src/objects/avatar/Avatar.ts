import { RoomObject } from "../../RoomObject";
import * as PIXI from "pixi.js";
import { AvatarLoaderResult } from "../../IAvatarLoader";
import {
  AvatarDrawPart,
  PrimaryAction,
  PrimaryActionKind,
  SecondaryActions,
} from "./util/getAvatarDrawDefinition";
import { getZOrder } from "../../util/getZOrder";
import { AvatarSprites } from "./AvatarSprites";
import { IAnimationTicker } from "../../IAnimationTicker";
import { avatarFrames, avatarFramesObject } from "./util/avatarFrames";
import { LookOptions } from "./util/createLookServer";

type RoomPosition = { roomX: number; roomY: number; roomZ: number };

class WalkAnimation {
  private walkFrames = 12;
  private current: RoomPosition | undefined;
  private diff: RoomPosition | undefined;
  private currentFrame: number = 0;
  private enqueued: {
    currentPosition: RoomPosition;
    newPosition: RoomPosition;
    direction: number;
  }[] = [];

  constructor(
    private animationTicker: IAnimationTicker,
    private callbacks: {
      onUpdatePosition: (position: RoomPosition, direction: number) => void;
      onStart: (direction: number) => void;
      onStop: () => void;
    }
  ) {}

  walk(
    currentPos: { roomX: number; roomY: number; roomZ: number },
    newPos: { roomX: number; roomY: number; roomZ: number },
    direction: number
  ) {
    if (this.diff != null) {
      this.enqueued.push({
        currentPosition: currentPos,
        newPosition: newPos,
        direction: direction,
      });
      return;
    }

    this.callbacks.onStart(direction);

    this.current = currentPos;
    this.diff = {
      roomX: newPos.roomX - currentPos.roomX,
      roomY: newPos.roomY - currentPos.roomY,
      roomZ: newPos.roomZ - currentPos.roomZ,
    };
    this.currentFrame = 0;

    const handleFinish = () => {
      this.diff = undefined;
      this.current = undefined;

      const next = this.enqueued.shift();
      if (next != null) {
        this.walk(next.currentPosition, next.newPosition, next.direction);
      } else {
        this.callbacks.onStop();
      }

      cancel();
    };

    const cancel = this.animationTicker.subscribe(() => {
      const factor = this.currentFrame / (this.walkFrames - 1);
      const current = this.current;
      const diff = this.diff;

      if (current != null && diff != null) {
        this.callbacks.onUpdatePosition(
          {
            roomX: current.roomX + diff.roomX * factor,
            roomY: current.roomY + diff.roomY * factor,
            roomZ: current.roomZ + diff.roomZ * factor,
          },
          direction
        );
      }

      if (factor >= 1) {
        handleFinish();
        return;
      }

      this.currentFrame++;
    });
  }
}

interface Options {
  look: string;
  direction: number;
  roomX: number;
  roomY: number;
  roomZ: number;
}

export class Avatar extends RoomObject {
  private avatarSprites: AvatarSprites | undefined;
  private walkAnimation: WalkAnimation | undefined;
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

  constructor({ look, roomX, roomY, roomZ, direction }: Options) {
    super();

    this._direction = direction;
    this._look = look;
    this._roomX = roomX;
    this._roomY = roomY;
    this._roomZ = roomZ;
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

    this.avatarSprites?.setLook(look);
  }

  private startAnimation() {
    if (this.cancelAnimation != null) return;

    this.frame = 0;

    this.cancelAnimation = this.animationTicker.subscribe((value) => {
      this.frame++;
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
    this.walkAnimation?.walk(
      { roomX: this.roomX, roomY: this.roomY, roomZ: this.roomZ },
      { roomX, roomY, roomZ },
      options?.direction ?? this.direction
    );

    this._roomX = roomX;
    this._roomY = roomY;
    this._roomZ = roomZ;
  }

  private calculateZIndex() {
    return getZOrder(this.roomX, this.roomY, this.roomZ) + 1;
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

  private updatePosition() {
    if (!this.mounted) return;

    const { roomX, roomY, roomZ } = this.getDisplayRoomPosition();

    const { x, y } = this.geometry.getPosition(roomX, roomY, roomZ);

    if (this.avatarSprites != null) {
      this.avatarSprites.x = x;
      this.avatarSprites.y = y;
    }
  }

  private calculatePosition() {
    const { roomX, roomY, roomZ } = this.getDisplayRoomPosition();

    return this.geometry.getPosition(roomX, roomY, roomZ);
  }

  registered(): void {
    this.avatarSprites = new AvatarSprites({
      look: this.getCurrentLookOptions(),
      zIndex: this.calculateZIndex(),
      position: this.calculatePosition(),
    });

    this.roomObjectContainer.addRoomObject(this.avatarSprites);
    this.walkAnimation = new WalkAnimation(this.animationTicker, {
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

  destroy(): void {
    this.avatarSprites?.destroy();

    if (this.cancelAnimation != null) {
      this.cancelAnimation();
    }
  }
}
