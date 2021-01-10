import * as PIXI from "pixi.js";

type PlanePoints = {
  a: { x: number; y: number };
  b: { x: number; y: number };
  c: { x: number; y: number };
  d: { x: number; y: number };
};

export function createPlaneMatrix(
  points: PlanePoints,
  {
    width,
    height,
    x,
    y,
  }: { width: number; height: number; x: number; y: number }
) {
  let diffDxCx = points.d.x - points.c.x;
  let diffDyCy = points.d.y - points.c.y;
  let diffBxCx = points.b.x - points.c.x;
  let diffByCy = points.b.y - points.c.y;

  if (Math.abs(diffBxCx - width) <= 1) {
    diffBxCx = width;
  }
  if (Math.abs(diffByCy - width) <= 1) {
    diffByCy = width;
  }
  if (Math.abs(diffDxCx - height) <= 1) {
    diffDxCx = height;
  }
  if (Math.abs(diffDyCy - height) <= 1) {
    diffDyCy = height;
  }

  const a = diffBxCx / width;
  const b = diffByCy / width;
  const c = diffDxCx / height;
  const d = diffDyCy / height;

  const baseX = x + points.c.x;
  const baseY = y + points.c.y;

  const matrix: PIXI.Matrix = new PIXI.Matrix(a, b, c, d, baseX, baseY);

  return matrix;
}
