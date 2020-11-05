import { RoomObject } from "../../RoomObject";
import * as PIXI from "pixi.js";
import { AvatarLoaderResult } from "../../IAvatarLoader";
import { AvatarDrawPart } from "./util/getAvatarDrawDefinition";
import { getZOrder } from "../../util/getZOrder";
import { AvatarSprites } from "./AvatarSprites";
import { IAnimationTicker } from "../../IAnimationTicker";
import { avatarFrames } from "./util/avatarFrames";

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

export class Avatar extends RoomObject {
  private avatarSprites: AvatarSprites | undefined;
  private walkAnimation: WalkAnimation | undefined;
  private walking: boolean = false;
  private frame: number = 0;

  private cancelAnimation: (() => void) | undefined;

  constructor(
    private look: string,
    private action: string,
    private direction: number,
    private position: { roomX: number; roomY: number; roomZ: number }
  ) {
    super();
  }

  private setAction(action: string) {
    const activeFrames = avatarFrames.get(action);

    if (this.cancelAnimation != null) {
      this.cancelAnimation();
    }

    this.frame = 0;

    if (activeFrames == null || activeFrames.length === 1) {
      this.updateFrame();
    } else {
      this.cancelAnimation = this.animationTicker.subscribe(() => {
        this.updateFrame();
        this.frame++;
      });
    }

    this.action = action;
    this.avatarSprites?.setAction(action);
  }

  private updateFrame() {
    this.avatarSprites?.setCurrentFrame(this.frame);
  }

  private updateAction() {
    if (this.walking) {
      this.setAction("wlk");
    } else {
      this.setAction("std");
    }
  }

  setDirection(direction: number) {
    this.direction = direction;
    this.avatarSprites?.setDirection(direction);
  }

  walk(roomX: number, roomY: number, roomZ: number, direction?: number) {
    this.walkAnimation?.walk(
      this.position,
      { roomX, roomY, roomZ },
      direction ?? this.direction
    );
    this.position = { roomX, roomY, roomZ };
  }

  private calculateZIndex() {
    return (
      getZOrder(this.position.roomX, this.position.roomY, this.position.roomZ) +
      1
    );
  }

  private calculatePosition() {
    return this.geometry.getPosition(
      this.position.roomX,
      this.position.roomY,
      this.position.roomZ
    );
  }

  registered(): void {
    this.avatarSprites = new AvatarSprites({
      action: this.action,
      look: this.look,
      zIndex: this.calculateZIndex(),
      position: this.calculatePosition(),
      direction: this.direction,
    });

    this.roomObjectContainer.addRoomObject(this.avatarSprites);
    this.walkAnimation = new WalkAnimation(this.animationTicker, {
      onUpdatePosition: (position, direction) => {
        const { x, y } = this.geometry.getPosition(
          position.roomX,
          position.roomY,
          position.roomZ
        );

        this.avatarSprites?.setPosition(x, y);
      },
      onStart: (direction: number) => {
        this.walking = true;
        this.setDirection(direction);
        this.updateAction();
      },
      onStop: () => {
        this.walking = false;
        this.updateAction();
      },
    });
  }

  destroy(): void {
    this.avatarSprites?.destroy();

    if (this.cancelAnimation != null) {
      this.cancelAnimation();
    }
  }
}
