import { HitDetection } from "./HitDetection";

test("detects hits on multiple elements", () => {
  const hitDetection = new HitDetection({
    view: { getBoundingClientRect: () => ({ x: 0, y: 0 }) },
  } as any);

  let firstClicked = false;
  let secondClicked = false;

  hitDetection.register({
    getHitBox: () => ({ x: 0, y: 0, width: 10, height: 10, zIndex: 10 }),
    hits: () => true,
    trigger: (type, event) => {
      firstClicked = true;
    },
  });

  hitDetection.register({
    getHitBox: () => ({ x: 0, y: 0, width: 5, height: 5, zIndex: 5 }),
    hits: () => true,
    trigger: (type, event) => {
      secondClicked = true;
    },
  });

  hitDetection.handleClick({ clientX: 2, clientY: 2 } as any);

  expect(firstClicked).toBe(true);
  expect(secondClicked).toBe(true);
});

test("doesn't detect if element out of bounds", () => {
  const hitDetection = new HitDetection({
    view: { getBoundingClientRect: () => ({ x: 0, y: 0 }) },
  } as any);

  let firstClicked = false;
  let secondClicked = false;

  hitDetection.register({
    getHitBox: () => ({ x: 0, y: 0, width: 10, height: 10, zIndex: 10 }),
    hits: () => true,
    trigger: (type, event) => {
      firstClicked = true;
    },
  });

  hitDetection.register({
    getHitBox: () => ({ x: 0, y: 0, width: 5, height: 5, zIndex: 5 }),
    hits: () => true,
    trigger: (type, event) => {
      secondClicked = true;
    },
  });

  hitDetection.handleClick({ clientX: 8, clientY: 8 } as any);

  expect(firstClicked).toBe(true);
  expect(secondClicked).toBe(false);
});

test("doesn't detect if element in bounds but doesn't hit", () => {
  const hitDetection = new HitDetection({
    view: { getBoundingClientRect: () => ({ x: 0, y: 0 }) },
  } as any);

  let firstClicked = false;
  let secondClicked = false;

  hitDetection.register({
    getHitBox: () => ({ x: 0, y: 0, width: 10, height: 10, zIndex: 10 }),
    hits: () => true,
    trigger: (type, event) => {
      firstClicked = true;
    },
  });

  hitDetection.register({
    getHitBox: () => ({ x: 0, y: 0, width: 5, height: 5, zIndex: 5 }),
    hits: () => false,
    trigger: (type, event) => {
      secondClicked = true;
    },
  });

  hitDetection.handleClick({ clientX: 2, clientY: 2 } as any);

  expect(firstClicked).toBe(true);
  expect(secondClicked).toBe(false);
});

test("intercepts event if element stops propagating", () => {
  const hitDetection = new HitDetection({
    view: { getBoundingClientRect: () => ({ x: 0, y: 0 }) },
  } as any);

  let firstClicked = false;
  let secondClicked = false;

  hitDetection.register({
    getHitBox: () => ({ x: 0, y: 0, width: 10, height: 10, zIndex: 10 }),
    hits: () => true,
    trigger: (type, event) => {
      firstClicked = true;
      event.stopPropagation();
    },
  });

  hitDetection.register({
    getHitBox: () => ({ x: 0, y: 0, width: 5, height: 5, zIndex: 5 }),
    hits: () => true,
    trigger: (type, event) => {
      secondClicked = true;
    },
  });

  hitDetection.handleClick({ clientX: 2, clientY: 2 } as any);

  expect(firstClicked).toBe(true);
  expect(secondClicked).toBe(false);
});
