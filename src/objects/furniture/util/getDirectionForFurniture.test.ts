import { getDirectionForFurniture } from "./getDirectionForFurniture";

test("gets direction 1", () => {
  expect(getDirectionForFurniture(0, [0, 2, 4, 6])).toEqual(0);
});

test("gets direction 2", () => {
  expect(getDirectionForFurniture(4, [0, 2, 4, 6])).toEqual(4);
});

test("gets direction 3", () => {
  expect(getDirectionForFurniture(3, [0, 2, 4, 6])).toEqual(2);
});

test("gets direction 4", () => {
  expect(getDirectionForFurniture(4, [0, 2])).toEqual(2);
});

test("gets direction 5", () => {
  expect(getDirectionForFurniture(0, [2, 4])).toEqual(2);
});
