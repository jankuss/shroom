import { HitDetection } from "./HitDetection";

const view = {
  getBoundingClientRect: () => ({ x: 0, y: 0 }),
  addEventListener: () => {
    // Do nothing
  },
};

test("detects hits on multiple elements", () => {
  const hitDetection = new HitDetection({
    view,
  } as any);

  let firstClicked = false;
  let secondClicked = false;

  hitDetection.register({
    getHitDetectionZIndex: () => 10,
    hits: () => true,
    trigger: () => {
      firstClicked = true;
    },
  });

  hitDetection.register({
    getHitDetectionZIndex: () => 5,
    hits: () => true,
    trigger: () => {
      secondClicked = true;
    },
  });

  hitDetection.handleClick({ clientX: 2, clientY: 2 } as any);

  expect(firstClicked).toBe(true);
  expect(secondClicked).toBe(true);
});

test("doesn't detect if element out of bounds", () => {
  const hitDetection = new HitDetection({
    view,
  } as any);

  let firstClicked = false;
  let secondClicked = false;

  hitDetection.register({
    getHitDetectionZIndex: () => 10,
    hits: () => true,
    trigger: () => {
      firstClicked = true;
    },
  });

  hitDetection.register({
    getHitDetectionZIndex: () => 5,
    hits: () => false,
    trigger: () => {
      secondClicked = true;
    },
  });

  hitDetection.handleClick({ clientX: 101, clientY: 101 } as any);

  expect(firstClicked).toBe(true);
  expect(secondClicked).toBe(false);
});

test("doesn't detect if element in bounds but doesn't hit", () => {
  const hitDetection = new HitDetection({
    view,
  } as any);

  let firstClicked = false;
  let secondClicked = false;

  hitDetection.register({
    getHitDetectionZIndex: () => 10,
    hits: () => true,
    trigger: () => {
      firstClicked = true;
    },
  });

  hitDetection.register({
    getHitDetectionZIndex: () => 5,
    hits: () => false,
    trigger: () => {
      secondClicked = true;
    },
  });

  hitDetection.handleClick({ clientX: 2, clientY: 2 } as any);

  expect(firstClicked).toBe(true);
  expect(secondClicked).toBe(false);
});

test("intercepts event if element stops propagating", () => {
  const hitDetection = new HitDetection({
    view,
  } as any);

  let firstClicked = false;
  let secondClicked = false;

  hitDetection.register({
    getHitDetectionZIndex: () => 10,
    hits: () => true,
    trigger: (type, event) => {
      firstClicked = true;
      event.stopPropagation();
    },
  });

  hitDetection.register({
    getHitDetectionZIndex: () => 5,
    hits: () => true,
    trigger: () => {
      secondClicked = true;
    },
  });

  hitDetection.handleClick({ clientX: 2, clientY: 2 } as any);

  expect(firstClicked).toBe(true);
  expect(secondClicked).toBe(false);
});
