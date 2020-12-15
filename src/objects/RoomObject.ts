import { IRoomContext } from "../interfaces/IRoomContext";
import { IRoomObject } from "../interfaces/IRoomObject";

export abstract class RoomObject implements IRoomObject {
  private context: IRoomContext | undefined;
  private isDestroyed: boolean = false;

  protected get mounted() {
    return this.context != null;
  }

  protected get configuration() {
    return this.getRoomContext().configuration;
  }

  protected get furnitureLoader() {
    return this.getRoomContext().furnitureLoader;
  }

  protected get animationTicker() {
    return this.getRoomContext().animationTicker;
  }

  protected get visualization() {
    return this.getRoomContext().visualization;
  }

  protected get geometry() {
    return this.getRoomContext().geometry;
  }

  protected get roomObjectContainer() {
    return this.getRoomContext().roomObjectContainer;
  }

  protected get avatarLoader() {
    return this.getRoomContext().avatarLoader;
  }

  protected get hitDetection() {
    return this.getRoomContext().hitDetection;
  }

  protected get tilemap() {
    return this.getRoomContext().tilemap;
  }

  protected get landscapeContainer() {
    return this.getRoomContext().landscapeContainer;
  }

  private getRoomContext(): IRoomContext {
    if (this.context == null) throw new Error("Invalid context");

    return this.context;
  }

  setParent(room: IRoomContext): void {
    if (this.context != null)
      throw new Error("RoomObject already provided with a context.");

    this.isDestroyed = false;
    this.context = room;

    this.registered();
  }

  destroy() {
    if (this.isDestroyed) return;

    // Important: set isDestroyed to true so this doesn't infinite loop.
    this.isDestroyed = true;

    this.roomObjectContainer.removeRoomObject(this);

    this.context = undefined;
    this.destroyed();
  }

  abstract destroyed(): void;
  abstract registered(): void;
}
