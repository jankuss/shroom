import * as PIXI from "pixi.js";
import TileAsset from "./assets/tile.png";
import { IRoomGeometry } from "./IRoomGeometry";

interface Props {
  geometry: IRoomGeometry;
  roomX: number;
  roomY: number;
  roomZ: number;
  edge?: boolean;
  tileHeight: number;
}

export class Tile extends PIXI.Container {
  constructor({
    geometry,
    roomX,
    roomY,
    roomZ,
    edge = false,
    tileHeight,
  }: Props) {
    super();

    const { x, y } = geometry.getPosition(roomX, roomY, roomZ);

    const baseX = x;
    const baseY = y + 16;

    const texture = PIXI.Texture.from(TileAsset);
    const floor = new PIXI.TilingSprite(texture);

    const matrix = new PIXI.Matrix(1, 0.5, 1, -0.5, baseX, baseY);

    const transform = new PIXI.Transform();
    transform.setFromMatrix(matrix);

    const tileTypeX = roomX % 2 === 0 ? 32 : 0;
    const tileTypeY = roomY % 2 === 0 ? 32 : 0;

    floor.x = x;
    floor.y = y;
    floor.width = 32;
    floor.height = 32;
    floor.tilePosition = new PIXI.Point(tileTypeX, tileTypeY);
    floor.transform = transform;

    floor.tint = 0xffffff;

    this.addChild(floor);

    if (edge) {
      const matrixEdgeLeft = new PIXI.Matrix(
        1,
        0.5,
        0,
        -1,
        baseX,
        baseY + tileHeight
      );
      const matrixEdgeRight = new PIXI.Matrix(-1, 0.5, 0, 1, baseX + 64, baseY);

      const transformEdgeLeft = new PIXI.Transform();
      transformEdgeLeft.setFromMatrix(matrixEdgeLeft);

      const transformEdgeRight = new PIXI.Transform();
      transformEdgeRight.setFromMatrix(matrixEdgeRight);

      const edgeLeftSprite = new PIXI.TilingSprite(texture);
      edgeLeftSprite.width = 32;
      edgeLeftSprite.height = tileHeight;
      edgeLeftSprite.transform = transformEdgeLeft;
      edgeLeftSprite.tilePosition = new PIXI.Point(tileTypeX, tileTypeY);

      const edgeRightSprite = new PIXI.TilingSprite(texture);
      edgeRightSprite.height = tileHeight;
      edgeRightSprite.width = 32;
      edgeRightSprite.transform = transformEdgeRight;
      edgeRightSprite.tilePosition = new PIXI.Point(tileTypeX, tileTypeY);

      this.addChild(edgeLeftSprite);
      this.addChild(edgeRightSprite);
    }
  }
}
