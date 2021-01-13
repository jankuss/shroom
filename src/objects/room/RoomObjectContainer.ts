import { IRoomContext } from "../../interfaces/IRoomContext";
import { IRoomObject } from "../../interfaces/IRoomObject";
import { IRoomObjectContainer } from "../../interfaces/IRoomObjectContainer";

export class RoomObjectContainer implements IRoomObjectContainer {
  private _roomObjects: Set<IRoomObject> = new Set();
  private _context: IRoomContext | undefined;

  public get roomObjects(): ReadonlySet<IRoomObject> {
    return this._roomObjects;
  }

  public get context() {
    return this._context;
  }

  public set context(value) {
    this._context = value;
  }

  addRoomObject(object: IRoomObject) {
    if (this._context == null)
      throw new Error("Context wasn't supplied to RoomObjectContainer");

    if (this._roomObjects.has(object)) {
      // The object already exists in this room.
      return;
    }

    object.setParent(this._context);

    this._roomObjects.add(object);
  }

  removeRoomObject(object: IRoomObject) {
    if (!this._roomObjects.has(object)) {
      return;
    }

    this._roomObjects.delete(object);

    object.destroy();
  }
}
