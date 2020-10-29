import { IRoomContext } from "./IRoomContext";
import { IRoomObject } from "./IRoomObject";

export abstract class RoomObject implements IRoomObject {
  private context: IRoomContext | undefined;

  getRoomContext(): IRoomContext {
    if (this.context == null) throw new Error("Invalid context");

    return this.context;
  }

  setParent(room: IRoomContext): void {
    this.context = room;

    this.registered();
  }

  abstract destroy(): void;
  abstract registered(): void;
}
