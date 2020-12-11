import { IRoomContext } from "../interfaces/IRoomContext";
import { IRoomObject } from "../interfaces/IRoomObject";

export abstract class RoomObject implements IRoomObject {
  private context: IRoomContext | undefined;

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
    this.context = room;

    this.registered();
  }

  abstract destroy(): void;
  abstract registered(): void;
}
