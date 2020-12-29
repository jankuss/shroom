import { parseTileMapString } from "../parseTileMapString";
import { getColumnWalls } from "./getColumnWalls";

test("parses single wall", () => {
  const tilemap = parseTileMapString(`
        xxx
        x00
        x00
    `);

  expect(getColumnWalls(tilemap)).toEqual([
    {
      startX: 1,
      endX: 2,
      y: 0,
      height: 0,
    },
  ]);
});
