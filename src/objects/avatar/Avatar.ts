import { RoomObject } from "../../RoomObject";
import * as PIXI from "pixi.js";
import { AvatarLoaderResult } from "../../IAvatarLoader";
import { AvatarDrawPart, PrimaryAction } from "./util/getAvatarDrawDefinition";
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

export class Avatar extends RoomObject {
  private avatarSprites: AvatarSprites | undefined;
  private walkAnimation: WalkAnimation | undefined;
  private walking: boolean = false;
  private waving: boolean = true;

  private frame: number = 0;

  private cancelAnimation: (() => void) | undefined;

  constructor(
    private look: string,
    private direction: number,
    private position: { roomX: number; roomY: number; roomZ: number }
  ) {
    super();
  }

  private getWavingAction() {
    if (this.waving) {
      return {
        frame:
          avatarFramesObject.wav[this.frame % avatarFramesObject.wav.length],
      };
    }
  }

  private getCurrentPrimaryAction(): PrimaryAction {
    if (this.walking) {
      return {
        kind: "wlk",
        frame:
          avatarFramesObject.wlk[this.frame % avatarFramesObject.wlk.length],
      };
    }

    return {
      kind: "std",
    };
  }

  private getCurrentLookOptions(): LookOptions {
    return {
      action: this.getCurrentPrimaryAction(),
      actions: {
        wav: this.getWavingAction(),
      },
      direction: this.direction,
      look: this.look,
    };
  }

  private updateAvatarSprites() {
    const look = this.getCurrentLookOptions();
    if (this.isAnimating(look)) {
      this.startAnimation();
    } else {
      this.stopAnimation();
    }

    this.avatarSprites?.setLook(look);
  }

  private startAnimation() {
    if (this.cancelAnimation != null) return;

    this.frame++;

    this.cancelAnimation = this.animationTicker.subscribe((value) => {
      this.frame++;
      this.updateAvatarSprites();
    });
  }

  private stopAnimation() {
    this.frame = 0;
    if (this.cancelAnimation != null) {
      this.cancelAnimation();
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

  setDirection(direction: number) {
    this.direction = direction;
    this.updateAvatarSprites();
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
      look: this.getCurrentLookOptions(),
      zIndex: this.calculateZIndex(),
      position: this.calculatePosition(),
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
        this.startWalking(direction);
      },
      onStop: () => {
        this.stopWalking();
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
