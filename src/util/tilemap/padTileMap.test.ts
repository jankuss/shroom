import { padTileMap } from "./padTileMap";

test("padTileMap offsets correcly", () => {
  expect(padTileMap([["0"]])).toEqual({
    tilemap: [["x"], ["0"]],
    offsetX: 0,
    offsetY: 1,
  });
});

test("padTileMap offsets correcly", () => {
  expect(
    padTileMap([
      ["0", "0"],
      ["0", "0"],
    ])
  ).toEqual({
    tilemap: [
      ["x", "x", "x"],
      ["x", "0", "0"],
      ["x", "0", "0"],
    ],
    offsetX: 1,
    offsetY: 1,
  });
});

test("padTileMap offsets correcly", () => {
  expect(
    padTileMap([
      ["0", "0"],
      ["0", "0"],
    ])
  ).toEqual({
    tilemap: [
      ["x", "x", "x"],
      ["x", "0", "0"],
      ["x", "0", "0"],
    ],
    offsetX: 1,
    offsetY: 1,
  });
});

test("if already padded, don't to anything", () => {
  expect(
    padTileMap([
      ["x", "x", "x"],
      ["x", "0", "0"],
      ["x", "0", "0"],
    ])
  ).toEqual({
    tilemap: [
      ["x", "x", "x"],
      ["x", "0", "0"],
      ["x", "0", "0"],
    ],
    offsetX: 0,
    offsetY: 0,
  });
});

test("don't pad if theres a door", () => {
  expect(
    padTileMap([
      ["x", "x", "x"],
      ["x", "0", "0"],
      ["0", "0", "0"],
      ["x", "0", "0"],
    ])
  ).toEqual({
    tilemap: [
      ["x", "x", "x"],
      ["x", "0", "0"],
      ["0", "0", "0"],
      ["x", "0", "0"],
    ],
    offsetX: 0,
    offsetY: 0,
  });
});

test("pad if there is two tiles in door column", () => {
  expect(
    padTileMap([
      ["x", "x", "x"],
      ["x", "0", "0"],
      ["0", "0", "0"],
      ["0", "0", "0"],
      ["x", "0", "0"],
    ])
  ).toEqual({
    tilemap: [
      ["x", "x", "x", "x"],
      ["x", "x", "0", "0"],
      ["x", "0", "0", "0"],
      ["x", "0", "0", "0"],
      ["x", "x", "0", "0"],
    ],
    offsetX: 1,
    offsetY: 0,
  });
});
