import * as PIXI from "pixi.js";
import { IRoomGeometry } from "./IRoomGeometry";
import WallAsset from "./assets/wall2.png";

interface Props {
  geometry: IRoomGeometry;
  roomX: number;
  roomY: number;
  direction: "left" | "right";
  tileHeight: number;
  wallHeight: number;
}

export class Wall extends PIXI.Container {
  constructor({
    geometry,
    roomX,
    roomY,
    direction,
    tileHeight,
    wallHeight,
  }: Props) {
    super();

    const displayHeight = wallHeight;

    const { x, y } = geometry.getPosition(roomX, roomY, 0);

    const baseX = x;
    const baseY = y + 16;

    const wallTexture = PIXI.Texture.from(WallAsset);

    const getTransform = () => {
      if (direction === "left") {
        const matrix = new PIXI.Matrix(
          -1,
          0.5,
          0,
          1,
          baseX + 64,
          baseY - displayHeight
        );

        const transform = new PIXI.Transform();
        transform.setFromMatrix(matrix);

        return transform;
      } else if (direction === "right") {
        const matrix = new PIXI.Matrix(
          1,
          0.5,
          0,
          1,
          baseX,
          baseY - displayHeight
        );

        const transform = new PIXI.Transform();
        transform.setFromMatrix(matrix);

        return transform;
      }

      throw new Error("Invalid direction");
    };

    const edgeRightSprite = new PIXI.TilingSprite(wallTexture);
    edgeRightSprite.height = displayHeight;
    edgeRightSprite.width = 32;
    edgeRightSprite.transform = getTransform();
    edgeRightSprite.tilePosition = new PIXI.Point(0, displayHeight);

    this.addChild(edgeRightSprite);
  }
}
