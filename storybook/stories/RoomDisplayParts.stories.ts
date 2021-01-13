import {
  WallLeft,
  WallRight,
  RoomModelVisualization,
  parseTileMapString,
} from "@jankuss/shroom";
import { ParsedTileMap } from "../../dist/objects/room/ParsedTileMap";
import { parseTileMap } from "../../dist/util/parseTileMap";
import { createShroom } from "./common/createShroom";

export default {
  title: "Room Display Parts",
};

export function WallLeftDefault() {
  return createShroom(({ container, shroom, application }) => {
    const left = new WallLeft();
    const right = new WallRight();

    left.x = 0;
    left.y = 0;

    right.x = 0;
    right.y = 0;

    //application.stage.addChild(left);
    application.stage.addChild(right);
  });
}

export function RoomVisualizationDefault() {
  return createShroom(({ container, shroom, application }) => {
    const roomVisualization = new RoomModelVisualization(
      new ParsedTileMap(
        parseTileMapString(`
        xxxxxxxxxxxx
        xxxxxxxxxxxx
        xxxxxxxxxxxx
        xxxxxxxxxxxx
        xxxxxxxxxxxx
        xxxxx000000x
        xxxxx000000x
        xxxx0000000x
        xxxxx000000x
        xxxxx000000x
        xxxxx000000x
        xxxxxxxxxxxx
        xxxxxxxxxxxx
        xxxxxxxxxxxx
        xxxxxxxxxxxx
        xxxxxxxxxxxx
    `)
      )
    );

    roomVisualization.x = 150;
    roomVisualization.y = 150;

    //application.stage.addChild(left);
    application.stage.addChild(roomVisualization);
  });
}
