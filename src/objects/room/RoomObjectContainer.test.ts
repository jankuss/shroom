import { RoomObject } from "../RoomObject";
import { RoomObjectContainer } from "./RoomObjectContainer";

test("adds & removes room objects", () => {
  class TestObject extends RoomObject {
    destroyed(): void {
      // Do nothing
    }
    registered(): void {
      // Do nothing
    }
  }

  const roomObjectContainer = new RoomObjectContainer();

  roomObjectContainer.context = {
    roomObjectContainer: roomObjectContainer,
  } as any;

  const object = new TestObject();
  roomObjectContainer.addRoomObject(object);
  expect(roomObjectContainer.roomObjects.has(object)).toBe(true);
  roomObjectContainer.removeRoomObject(object);
  expect(roomObjectContainer.roomObjects.has(object)).toBe(false);
});

test("destroy on RoomObject removes room object from RoomObjectContainer", () => {
  class TestObject extends RoomObject {
    destroyed(): void {
      // Do nothing
    }
    registered(): void {
      // Do nothing
    }
  }

  const roomObjectContainer = new RoomObjectContainer();

  roomObjectContainer.context = {
    roomObjectContainer: roomObjectContainer,
  } as any;

  const object = new TestObject();
  roomObjectContainer.addRoomObject(object);
  expect(roomObjectContainer.roomObjects.has(object)).toBe(true);
  object.destroy();
  expect(roomObjectContainer.roomObjects.has(object)).toBe(false);
});
