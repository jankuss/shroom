import { RoomObject } from "./RoomObject";

test("setParent calls registered", () => {
  let registered = false;

  class TestObject extends RoomObject {
    destroyed(): void {
      // Do nothing
    }

    registered(): void {
      registered = true;
    }
  }

  const obj = new TestObject();
  obj.setParent({} as any);

  expect(registered).toBe(true);
});

test("setParent sets the context", () => {
  const context = { geometry: "geometry" } as any;

  class TestObject extends RoomObject {
    destroyed(): void {
      // Do nothing
    }

    registered(): void {
      expect(this.geometry).toEqual("geometry");
    }
  }

  const obj = new TestObject();

  obj.setParent(context);
});

test("destroy calls destroyed", () => {
  const context = {
    geometry: "geometry",
    roomObjectContainer: {
      removeRoomObject: () => {
        // Do nothing
      },
    },
  } as any;
  let destroyed = false;

  class TestObject extends RoomObject {
    destroyed(): void {
      destroyed = true;
    }

    registered(): void {
      // Do nothing
    }
  }

  const obj = new TestObject();

  obj.setParent(context);
  obj.destroy();

  expect(destroyed).toEqual(true);
});

test("destroy removes element from roomObjectContainer", () => {
  const removeRoomObject = jest.fn();
  const context = {
    geometry: "geometry",
    roomObjectContainer: { removeRoomObject },
  } as any;
  class TestObject extends RoomObject {
    destroyed(): void {
      // Do nothing
    }
    registered(): void {
      // Do nothing
    }
  }

  const obj = new TestObject();

  obj.setParent(context);
  obj.destroy();

  expect(removeRoomObject).toBeCalledWith(obj);
});

test("multiple destroy calls ignores after one", () => {
  const removeRoomObject = jest.fn();
  const context = {
    geometry: "geometry",
    roomObjectContainer: { removeRoomObject },
  } as any;
  class TestObject extends RoomObject {
    destroyed(): void {
      // Do nothing
    }
    registered(): void {
      // Do nothing
    }
  }

  const obj = new TestObject();

  obj.setParent(context);
  obj.destroy();
  obj.destroy();
  obj.destroy();

  expect(removeRoomObject).toBeCalledTimes(1);
  expect(removeRoomObject).toBeCalledWith(obj);
});

test("accessing context before setParent is called throws error", () => {
  class TestObject extends RoomObject {
    constructor() {
      super();

      this.geometry;
    }

    destroyed(): void {
      // Do nothing
    }
    registered(): void {
      // Do nothing
    }
  }

  expect(() => new TestObject()).toThrowError("Invalid context");
});
