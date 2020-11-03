import { IFurnitureLoader } from "./IFurnitureLoader";
import { IRoomContext } from "./IRoomContext";
import { IRoomObject } from "./IRoomObject";

export abstract class RoomObject implements IRoomObject {
  private context: IRoomContext | undefined;

  get furnitureLoader() {
    return this.getRoomContext().furnitureLoader;
  }

  get animationTicker() {
    return this.getRoomContext().animationTicker;
  }

  get visualization() {
    return this.getRoomContext().visualization;
  }

  get geometry() {
    return this.getRoomContext().geometry;
  }

  get roomObjectContainer() {
    return this.getRoomContext().roomObjectContainer;
  }

  get avatarLoader() {
    return this.getRoomContext().avatarLoader;
  }

  private getRoomContext(): IRoomContext {
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
