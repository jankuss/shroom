import { InteractionEvent } from "pixi.js";
import { BehaviorSubject } from "rxjs";
import { Rectangle } from "../room/IRoomRectangle";
import { EventManager } from "./EventManager";
import {
  AVATAR,
  FURNITURE,
  IEventGroup,
  TILE_CURSOR,
} from "./interfaces/IEventGroup";
import { IEventTarget } from "./interfaces/IEventTarget";

const interactionEvent: InteractionEvent = {
  data: {},
} as any;

test("handles click when mounted", () => {
  const manager = new EventManager();

  const target: IEventTarget = {
    getEventZOrder: () => 10,
    getGroup: () => ({ getEventGroupIdentifier: () => FURNITURE }),
    getRectangleObservable: () =>
      new BehaviorSubject<Rectangle>({ x: 0, y: 0, width: 100, height: 100 }),
    hits: () => true,
    triggerClick: jest.fn(),
    triggerPointerDown: jest.fn(),
    triggerPointerOut: jest.fn(),
    triggerPointerOver: jest.fn(),
    triggerPointerUp: jest.fn(),
    triggerPointerTargetChanged: jest.fn(),
  };

  const node = manager.register(target);
  manager.click(interactionEvent, 10, 10);
  expect(target.triggerClick).toHaveBeenCalledTimes(1);

  node.destroy();
  manager.click(interactionEvent, 10, 10);
  expect(target.triggerClick).toHaveBeenCalledTimes(1);
});

test("handles click on hit elements", () => {
  const manager = new EventManager();

  const target: IEventTarget = {
    getEventZOrder: () => 10,
    getGroup: () => ({ getEventGroupIdentifier: () => FURNITURE }),
    getRectangleObservable: () =>
      new BehaviorSubject<Rectangle>({ x: 0, y: 0, width: 100, height: 100 }),
    hits: () => true,
    triggerClick: jest.fn(),
    triggerPointerDown: jest.fn(),
    triggerPointerOut: jest.fn(),
    triggerPointerOver: jest.fn(),
    triggerPointerUp: jest.fn(),
    triggerPointerTargetChanged: jest.fn(),
  };

  const node = manager.register(target);
  manager.click(interactionEvent, 10, 10);
  expect(target.triggerClick).toHaveBeenCalledTimes(1);
});

test("doesn't handle click on not hit elements", () => {
  const manager = new EventManager();

  const target: IEventTarget = {
    getEventZOrder: () => 10,
    getGroup: () => ({ getEventGroupIdentifier: () => FURNITURE }),
    getRectangleObservable: () =>
      new BehaviorSubject<Rectangle>({ x: 0, y: 0, width: 100, height: 100 }),
    hits: () => false,
    triggerClick: jest.fn(),
    triggerPointerDown: jest.fn(),
    triggerPointerOut: jest.fn(),
    triggerPointerOver: jest.fn(),
    triggerPointerUp: jest.fn(),
    triggerPointerTargetChanged: jest.fn(),
  };

  const node = manager.register(target);
  manager.click(interactionEvent, 10, 10);
  expect(target.triggerClick).toHaveBeenCalledTimes(0);
});

test("handles click on multiple elements", () => {
  const manager = new EventManager();

  const target1: IEventTarget = {
    getEventZOrder: () => 2,
    getGroup: () => ({ getEventGroupIdentifier: () => FURNITURE }),
    getRectangleObservable: () =>
      new BehaviorSubject<Rectangle>({ x: 0, y: 0, width: 100, height: 100 }),
    hits: () => true,
    triggerClick: jest.fn(),
    triggerPointerDown: jest.fn(),
    triggerPointerOut: jest.fn(),
    triggerPointerOver: jest.fn(),
    triggerPointerUp: jest.fn(),
    triggerPointerTargetChanged: jest.fn(),
  };

  const target2: IEventTarget = {
    getEventZOrder: () => 5,
    getGroup: () => ({ getEventGroupIdentifier: () => FURNITURE }),
    getRectangleObservable: () =>
      new BehaviorSubject<Rectangle>({ x: 50, y: 50, width: 100, height: 100 }),
    hits: () => true,
    triggerClick: jest.fn(),
    triggerPointerDown: jest.fn(),
    triggerPointerOut: jest.fn(),
    triggerPointerOver: jest.fn(),
    triggerPointerUp: jest.fn(),
    triggerPointerTargetChanged: jest.fn(),
  };

  const target3: IEventTarget = {
    getEventZOrder: () => 10,
    getGroup: () => ({ getEventGroupIdentifier: () => FURNITURE }),
    getRectangleObservable: () =>
      new BehaviorSubject<Rectangle>({ x: 75, y: 75, width: 100, height: 100 }),
    hits: () => true,
    triggerClick: jest.fn(),
    triggerPointerDown: jest.fn(),
    triggerPointerOut: jest.fn(),
    triggerPointerOver: jest.fn(),
    triggerPointerUp: jest.fn(),
    triggerPointerTargetChanged: jest.fn(),
  };

  const target4: IEventTarget = {
    getEventZOrder: () => 10,
    getGroup: () => ({ getEventGroupIdentifier: () => FURNITURE }),
    getRectangleObservable: () =>
      new BehaviorSubject<Rectangle>({ x: 79, y: 79, width: 100, height: 100 }),
    hits: () => false,
    triggerClick: jest.fn(),
    triggerPointerDown: jest.fn(),
    triggerPointerOut: jest.fn(),
    triggerPointerOver: jest.fn(),
    triggerPointerUp: jest.fn(),
    triggerPointerTargetChanged: jest.fn(),
  };

  manager.register(target1);
  manager.register(target2);
  manager.register(target3);
  manager.register(target4);

  manager.click(interactionEvent, 80, 80);
  expect(target1.triggerClick).toHaveBeenCalledTimes(1);
  expect(target2.triggerClick).toHaveBeenCalledTimes(1);
  expect(target3.triggerClick).toHaveBeenCalledTimes(1);
  expect(target4.triggerClick).toHaveBeenCalledTimes(0);
});

test("handles click on multiple elements", () => {
  const manager = new EventManager();

  const target1: IEventTarget = {
    getEventZOrder: () => 2,
    getGroup: () => ({ getEventGroupIdentifier: () => FURNITURE }),
    getRectangleObservable: () =>
      new BehaviorSubject<Rectangle>({ x: 0, y: 0, width: 100, height: 100 }),
    hits: () => true,
    triggerClick: jest.fn(),
    triggerPointerDown: jest.fn(),
    triggerPointerOut: jest.fn(),
    triggerPointerOver: jest.fn(),
    triggerPointerUp: jest.fn(),
    triggerPointerTargetChanged: jest.fn(),
  };

  const target2: IEventTarget = {
    getEventZOrder: () => 5,
    getGroup: () => ({ getEventGroupIdentifier: () => FURNITURE }),
    getRectangleObservable: () =>
      new BehaviorSubject<Rectangle>({ x: 50, y: 50, width: 100, height: 100 }),
    hits: () => true,
    triggerClick: jest.fn(),
    triggerPointerDown: jest.fn(),
    triggerPointerOut: jest.fn(),
    triggerPointerOver: jest.fn(),
    triggerPointerUp: jest.fn(),
    triggerPointerTargetChanged: jest.fn(),
  };

  manager.register(target1);
  manager.register(target2);

  manager.click(interactionEvent, 80, 80);
  expect(target1.triggerClick).toHaveBeenCalledTimes(1);
  expect(target2.triggerClick).toHaveBeenCalledTimes(1);
});

test("only handles first element when elements from same group", () => {
  const manager = new EventManager();

  const group: IEventGroup = { getEventGroupIdentifier: () => FURNITURE };

  const target1: IEventTarget = {
    getEventZOrder: () => 2,
    getGroup: () => group,
    getRectangleObservable: () =>
      new BehaviorSubject<Rectangle>({ x: 0, y: 0, width: 100, height: 100 }),
    hits: () => true,
    triggerClick: jest.fn(),
    triggerPointerDown: jest.fn(),
    triggerPointerOut: jest.fn(),
    triggerPointerOver: jest.fn(),
    triggerPointerUp: jest.fn(),
    triggerPointerTargetChanged: jest.fn(),
  };

  const target2: IEventTarget = {
    getEventZOrder: () => 5,
    getGroup: () => group,
    getRectangleObservable: () =>
      new BehaviorSubject<Rectangle>({ x: 50, y: 50, width: 100, height: 100 }),
    hits: () => true,
    triggerClick: jest.fn(),
    triggerPointerDown: jest.fn(),
    triggerPointerOut: jest.fn(),
    triggerPointerOver: jest.fn(),
    triggerPointerUp: jest.fn(),
    triggerPointerTargetChanged: jest.fn(),
  };

  manager.register(target1);
  manager.register(target2);

  manager.click(interactionEvent, 80, 80);
  expect(target1.triggerClick).toHaveBeenCalledTimes(0);
  expect(target2.triggerClick).toHaveBeenCalledTimes(1);
});

test("event.skip() skips elements", () => {
  const manager = new EventManager();

  const target1: IEventTarget = {
    getEventZOrder: () => 2,
    getGroup: () => ({ getEventGroupIdentifier: () => AVATAR }),
    getRectangleObservable: () =>
      new BehaviorSubject<Rectangle>({ x: 0, y: 0, width: 100, height: 100 }),
    hits: () => true,
    triggerClick: jest.fn(),
    triggerPointerDown: jest.fn(),
    triggerPointerOut: jest.fn(),
    triggerPointerOver: jest.fn(),
    triggerPointerUp: jest.fn(),
    triggerPointerTargetChanged: jest.fn(),
  };

  const target2: IEventTarget = {
    getEventZOrder: () => 5,
    getGroup: () => ({ getEventGroupIdentifier: () => AVATAR }),
    getRectangleObservable: () =>
      new BehaviorSubject<Rectangle>({ x: 50, y: 50, width: 100, height: 100 }),
    hits: () => true,
    triggerClick: jest.fn((event) => event.skip([AVATAR])),
    triggerPointerDown: jest.fn(),
    triggerPointerOut: jest.fn(),
    triggerPointerOver: jest.fn(),
    triggerPointerUp: jest.fn(),
    triggerPointerTargetChanged: jest.fn(),
  };

  const target3: IEventTarget = {
    getEventZOrder: () => 9,
    getGroup: () => ({ getEventGroupIdentifier: () => FURNITURE }),
    getRectangleObservable: () =>
      new BehaviorSubject<Rectangle>({ x: 75, y: 75, width: 100, height: 100 }),
    hits: () => true,
    triggerClick: jest.fn(),
    triggerPointerDown: jest.fn(),
    triggerPointerOut: jest.fn(),
    triggerPointerOver: jest.fn(),
    triggerPointerUp: jest.fn(),
    triggerPointerTargetChanged: jest.fn(),
  };

  const target4: IEventTarget = {
    getEventZOrder: () => 10,
    getGroup: () => ({ getEventGroupIdentifier: () => FURNITURE }),
    getRectangleObservable: () =>
      new BehaviorSubject<Rectangle>({ x: 79, y: 79, width: 100, height: 100 }),
    hits: () => true,
    triggerClick: jest.fn((event) => event.skip([FURNITURE])),
    triggerPointerDown: jest.fn(),
    triggerPointerOut: jest.fn(),
    triggerPointerOver: jest.fn(),
    triggerPointerUp: jest.fn(),
    triggerPointerTargetChanged: jest.fn(),
  };

  manager.register(target1);
  manager.register(target2);
  manager.register(target3);
  manager.register(target4);

  manager.click(interactionEvent, 80, 80);
  expect(target1.triggerClick).toHaveBeenCalledTimes(0);
  expect(target2.triggerClick).toHaveBeenCalledTimes(1);
  expect(target3.triggerClick).toHaveBeenCalledTimes(0);
  expect(target4.triggerClick).toHaveBeenCalledTimes(1);
});

test("move triggers correct events", () => {
  const manager = new EventManager();

  const target1: IEventTarget = {
    getEventZOrder: () => 2,
    getGroup: () => ({ getEventGroupIdentifier: () => AVATAR }),
    getRectangleObservable: () =>
      new BehaviorSubject<Rectangle>({ x: 0, y: 0, width: 100, height: 100 }),
    hits: (x) => x <= 100,
    triggerClick: jest.fn(),
    triggerPointerDown: jest.fn(),
    triggerPointerOut: jest.fn(),
    triggerPointerOver: jest.fn(),
    triggerPointerUp: jest.fn(),
    triggerPointerTargetChanged: jest.fn(),
  };

  manager.register(target1);
  manager.move(interactionEvent, 80, 80);
  expect(target1.triggerPointerOver).toHaveBeenCalledTimes(1);
  expect(target1.triggerPointerOut).toHaveBeenCalledTimes(0);

  manager.move(interactionEvent, 85, 80);
  expect(target1.triggerPointerOver).toHaveBeenCalledTimes(1);
  expect(target1.triggerPointerOut).toHaveBeenCalledTimes(0);

  manager.move(interactionEvent, 90, 80);
  expect(target1.triggerPointerOver).toHaveBeenCalledTimes(1);
  expect(target1.triggerPointerOut).toHaveBeenCalledTimes(0);

  manager.move(interactionEvent, 95, 80);
  expect(target1.triggerPointerOver).toHaveBeenCalledTimes(1);
  expect(target1.triggerPointerOut).toHaveBeenCalledTimes(0);

  manager.move(interactionEvent, 100, 80);
  expect(target1.triggerPointerOver).toHaveBeenCalledTimes(1);
  expect(target1.triggerPointerOut).toHaveBeenCalledTimes(0);

  manager.move(interactionEvent, 105, 80);
  expect(target1.triggerPointerOver).toHaveBeenCalledTimes(1);
  expect(target1.triggerPointerOut).toHaveBeenCalledTimes(1);

  manager.move(interactionEvent, 100, 80);
  expect(target1.triggerPointerOver).toHaveBeenCalledTimes(2);
  expect(target1.triggerPointerOut).toHaveBeenCalledTimes(1);

  manager.move(interactionEvent, 105, 80);
  expect(target1.triggerPointerOver).toHaveBeenCalledTimes(2);
  expect(target1.triggerPointerOut).toHaveBeenCalledTimes(2);
});

test("event.skipExcept() skips elements except the specified", () => {
  const manager = new EventManager();

  const target1: IEventTarget = {
    getEventZOrder: () => 2,
    getGroup: () => ({ getEventGroupIdentifier: () => TILE_CURSOR }),
    getRectangleObservable: () =>
      new BehaviorSubject<Rectangle>({ x: 0, y: 0, width: 100, height: 100 }),
    hits: () => true,
    triggerClick: jest.fn(),
    triggerPointerDown: jest.fn(),
    triggerPointerOut: jest.fn(),
    triggerPointerOver: jest.fn(),
    triggerPointerUp: jest.fn(),
    triggerPointerTargetChanged: jest.fn(),
  };

  const target2: IEventTarget = {
    getEventZOrder: () => 5,
    getGroup: () => ({ getEventGroupIdentifier: () => AVATAR }),
    getRectangleObservable: () =>
      new BehaviorSubject<Rectangle>({ x: 50, y: 50, width: 100, height: 100 }),
    hits: () => true,
    triggerClick: jest.fn((event) => event.skipExcept(TILE_CURSOR)),
    triggerPointerDown: jest.fn(),
    triggerPointerOut: jest.fn(),
    triggerPointerOver: jest.fn(),
    triggerPointerUp: jest.fn(),
    triggerPointerTargetChanged: jest.fn(),
  };

  const target3: IEventTarget = {
    getEventZOrder: () => 9,
    getGroup: () => ({ getEventGroupIdentifier: () => FURNITURE }),
    getRectangleObservable: () =>
      new BehaviorSubject<Rectangle>({ x: 75, y: 75, width: 100, height: 100 }),
    hits: () => true,
    triggerClick: jest.fn(),
    triggerPointerDown: jest.fn(),
    triggerPointerOut: jest.fn(),
    triggerPointerOver: jest.fn(),
    triggerPointerUp: jest.fn(),
    triggerPointerTargetChanged: jest.fn(),
  };

  const target4: IEventTarget = {
    getEventZOrder: () => 10,
    getGroup: () => ({ getEventGroupIdentifier: () => FURNITURE }),
    getRectangleObservable: () =>
      new BehaviorSubject<Rectangle>({ x: 79, y: 79, width: 100, height: 100 }),
    hits: () => true,
    triggerClick: jest.fn((event) => event.skipExcept(AVATAR, TILE_CURSOR)),
    triggerPointerDown: jest.fn(),
    triggerPointerOut: jest.fn(),
    triggerPointerOver: jest.fn(),
    triggerPointerUp: jest.fn(),
    triggerPointerTargetChanged: jest.fn(),
  };

  manager.register(target1);
  manager.register(target2);
  manager.register(target3);
  manager.register(target4);

  manager.click(interactionEvent, 80, 80);
  expect(target1.triggerClick).toHaveBeenCalledTimes(1);
  expect(target2.triggerClick).toHaveBeenCalledTimes(1);
  expect(target3.triggerClick).toHaveBeenCalledTimes(0);
  expect(target4.triggerClick).toHaveBeenCalledTimes(1);
});
