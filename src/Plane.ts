import * as PIXI from "pixi.js";
import TileAsset from "./assets/tile.png";

interface Props {
  x: number;
  y: number;
  points: PlanePoints;
  width: number;
  height: number;
  xEven: boolean;
  yEven: boolean;
  floor: boolean;
  tint: number;
}

type PlanePoints = {
  a: { x: number; y: number };
  b: { x: number; y: number };
  c: { x: number; y: number };
  d: { x: number; y: number };
};

const texture = PIXI.Texture.from(TileAsset);

export function createPlaneSprite(props: Props) {
  const { x, y, points, xEven, yEven, floor, width, height, tint } = props;

  const xWidth = 32;
  const xHeight = 32;

  let _local_3 = points.d.x - points.c.x;
  let _local_4 = points.d.y - points.c.y;
  let _local_5 = points.b.x - points.c.x;
  let _local_6 = points.b.y - points.c.y;

  if (floor) {
    if (Math.abs(_local_5 - xWidth) <= 1) {
      _local_5 = xWidth;
    }
    if (Math.abs(_local_6 - xWidth) <= 1) {
      _local_6 = xWidth;
    }
    if (Math.abs(_local_3 - xHeight) <= 1) {
      _local_3 = xHeight;
    }
    if (Math.abs(_local_4 - xHeight) <= 1) {
      _local_4 = xHeight;
    }
  }

  var _local_7 = _local_5 / xWidth;
  var _local_8 = _local_6 / xWidth;
  var _local_9 = _local_3 / xHeight;
  var _local_10 = _local_4 / xHeight;

  const baseX = x + points.c.x;
  const baseY = y + points.c.y;

  var _local_11: PIXI.Matrix = new PIXI.Matrix(
    _local_7,
    _local_8,
    _local_9,
    _local_10,
    baseX,
    baseY
  );

  const tileTypeX = xEven ? 32 : 0;
  const tileTypeY = yEven ? 32 : 0;

  const sprite = new PIXI.TilingSprite(texture);

  const transform = new PIXI.Transform();
  transform.setFromMatrix(_local_11);

  sprite.x = x;
  sprite.y = y;
  sprite.width = width;
  sprite.height = height;
  sprite.tilePosition = new PIXI.Point(tileTypeX, tileTypeY);
  sprite.transform = transform;

  sprite.tint = tint;

  return sprite;
}
