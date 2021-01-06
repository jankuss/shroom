import { IAnimationTicker } from "../../interfaces/IAnimationTicker";
import { RoomPosition } from "../../types/RoomPosition";

export class ObjectAnimation<T> {
  private current: RoomPosition | undefined;
  private diff: RoomPosition | undefined;
  private start: number = 0;
  private enqueued: {
    currentPosition: RoomPosition;
    newPosition: RoomPosition;
    data: T;
  }[] = [];
  private nextPosition: RoomPosition | undefined;

  constructor(
    private animationTicker: IAnimationTicker,
    private callbacks: {
      onUpdatePosition: (position: RoomPosition, data: T) => void;
      onStart: (data: T) => void;
      onStop: (data: T) => void;
    },
    private duration: number = 500
  ) {}

  clear() {
    this.enqueued = [];
    return this.nextPosition;
  }

  move(
    currentPos: { roomX: number; roomY: number; roomZ: number },
    newPos: { roomX: number; roomY: number; roomZ: number },
    data: T
  ) {
    if (this.diff != null) {
      this.enqueued.push({
        currentPosition: currentPos,
        newPosition: newPos,
        data: data,
      });
      return;
    }

    this.callbacks.onStart(data);

    this.current = currentPos;
    this.diff = {
      roomX: newPos.roomX - currentPos.roomX,
      roomY: newPos.roomY - currentPos.roomY,
      roomZ: newPos.roomZ - currentPos.roomZ,
    };

    this.nextPosition = newPos;
    this.start = performance.now();

    const handleFinish = () => {
      this.diff = undefined;
      this.current = undefined;

      const next = this.enqueued.shift();
      if (next != null) {
        this.move(next.currentPosition, next.newPosition, next.data);
      } else {
        this.callbacks.onStop(data);
      }

      cancel();
    };

    this.callbacks.onUpdatePosition(
      {
        roomX: this.current.roomX,
        roomY: this.current.roomY,
        roomZ: this.current.roomZ,
      },
      data
    );

    const cancel = this.animationTicker.subscribe((value, accurate) => {
      const timeDiff = performance.now() - this.start;

      let factor = timeDiff / this.duration;
      const current = this.current;
      const diff = this.diff;

      if (factor > 1) {
        factor = 1;
      }

      if (current != null && diff != null) {
        this.callbacks.onUpdatePosition(
          {
            roomX: current.roomX + diff.roomX * factor,
            roomY: current.roomY + diff.roomY * factor,
            roomZ: current.roomZ + diff.roomZ * factor,
          },
          data
        );
      }

      if (factor >= 1) {
        handleFinish();
        return;
      }
    });
  }
}
