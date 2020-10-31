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
  let _local_3 = points.d.x - points.c.x;
  let _local_4 = points.d.y - points.c.y;
  let _local_5 = points.b.x - points.c.x;
  let _local_6 = points.b.y - points.c.y;

  if (Math.abs(_local_5 - width) <= 1) {
    _local_5 = width;
  }
  if (Math.abs(_local_6 - width) <= 1) {
    _local_6 = width;
  }
  if (Math.abs(_local_3 - height) <= 1) {
    _local_3 = height;
  }
  if (Math.abs(_local_4 - height) <= 1) {
    _local_4 = height;
  }

  var a = _local_5 / width;
  var b = _local_6 / width;
  var c = _local_3 / height;
  var d = _local_4 / height;

  const baseX = x + points.c.x;
  const baseY = y + points.c.y;

  var matrix: PIXI.Matrix = new PIXI.Matrix(a, b, c, d, baseX, baseY);

  return matrix;
}
