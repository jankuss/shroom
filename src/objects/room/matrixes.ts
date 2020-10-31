import { createPlaneMatrix } from "./util/createPlaneMatrix";

export function getFloorMatrix(x: number, y: number) {
  return createPlaneMatrix(
    {
      c: { x: 0, y: 16 },
      d: { x: 32, y: 0 },
      a: { x: 64, y: 16 },
      b: { x: 32, y: 32 },
    },
    { width: 32, height: 32, x, y }
  );
}

export function getLeftMatrix(
  x: number,
  y: number,
  dim: { width: number; height: number }
) {
  return createPlaneMatrix(
    {
      b: { x: 0, y: 16 },
      c: { x: dim.width, y: 16 + dim.width / 2 },
      d: { x: dim.width, y: 16 + dim.width / 2 + dim.height },
      a: { x: 0, y: 16 + dim.height },
    },
    { width: dim.width, height: dim.height, x, y }
  );
}

export function getRightMatrix(
  x: number,
  y: number,
  dim: { width: number; height: number }
) {
  return createPlaneMatrix(
    {
      b: { x: 32, y: 32 },
      c: { x: 32 + dim.width, y: 32 - dim.width / 2 },
      d: { x: 32 + dim.width, y: 32 + dim.height - dim.width / 2 },
      a: { x: 32, y: 32 + dim.height },
    },
    {
      width: dim.width,
      height: dim.height,
      x: x,
      y: y,
    }
  );
}
