import { parseTileMap, ParsedTileType } from "./parseTileMap";

function wall(
  kind: "colWall" | "rowWall" | "outerCorner" | "innerCorner"
): ParsedTileType {
  return { type: "wall", kind };
}

function tile(): ParsedTileType {
  return { type: "tile" };
}

function hidden(): ParsedTileType {
  return { type: "hidden" };
}

const R: ParsedTileType = { type: "wall", kind: "rowWall" };
const C: ParsedTileType = { type: "wall", kind: "colWall" };
const T: ParsedTileType = { type: "tile" };
const X: ParsedTileType = { type: "hidden" };
const D: ParsedTileType = { type: "wall", kind: "outerCorner" };
const E: ParsedTileType = { type: "wall", kind: "innerCorner" };

test("parses basic tilemap", () => {
  expect(
    parseTileMap([
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0]
    ])
  ).toEqual([
    [D, C, C, C],
    [R, T, T, T],
    [R, T, T, T],
    [R, T, T, T],
    [R, T, T, T],
    [R, T, T, T]
  ]);
});

test("ignores unnecessary spacing", () => {
  expect(
    parseTileMap([
      ["x", "x", "x", "x", "x", "x", "x", "x"],
      ["x", "x", "x", "x", "x", "x", "x", "x"],
      ["x", "x", "x", 0, 0, 0, "x", "x"],
      ["x", "x", "x", 0, 0, 0, "x", "x"],
      ["x", "x", "x", 0, 0, 0, "x", "x"],
      ["x", "x", "x", 0, 0, 0, "x", "x"],
      ["x", "x", "x", 0, 0, 0, "x", "x"],
      ["x", "x", "x", "x", "x", "x", "x", "x"],
      ["x", "x", "x", "x", "x", "x", "x", "x"]
    ])
  ).toEqual([
    [D, C, C, C],
    [R, T, T, T],
    [R, T, T, T],
    [R, T, T, T],
    [R, T, T, T],
    [R, T, T, T]
  ]);
});

test("inner corner", () => {
  expect(
    parseTileMap([
      ["x", 0, 0],
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0]
    ])
  ).toEqual([
    [X, D, C, C],
    [D, E, T, T],
    [R, T, T, T],
    [R, T, T, T],
    [R, T, T, T],
    [R, T, T, T]
  ]);
});

test("rowWall doesnt overlap tile", () => {
  expect(
    parseTileMap([
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
      ["x", 0, 0]
    ])
  ).toEqual([
    [D, C, C, C],
    [R, T, T, T],
    [R, T, T, T],
    [R, T, T, T],
    [R, T, T, T],
    [X, X, T, T]
  ]);
});

test("colWall doesnt overlap tile", () => {
  expect(
    parseTileMap([
      [0, 0, "x"],
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0]
    ])
  ).toEqual([
    [D, C, C, X],
    [R, T, T, X],
    [R, T, T, T],
    [R, T, T, T],
    [R, T, T, T],
    [R, T, T, T]
  ]);
});
