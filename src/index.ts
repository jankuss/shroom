import * as PIXI from "pixi.js";

import { parseTileMapString } from "./util/parseTileMapString";
import { Furniture } from "./objects/furniture/Furniture";
import { AnimationTicker } from "./AnimationTicker";

import TileAsset from "./assets/tile.png";
import WallAsset from "./assets/wall.png";
import Wall2Asset from "./assets/wall2.png";
import { FurnitureLoader } from "./objects/furniture/FurnitureLoader";
import { Room } from "./objects/room/Room";

const view = document.querySelector("#root") as HTMLCanvasElement | undefined;
const container = document.querySelector("#container") as
  | HTMLDivElement
  | undefined;
if (view == null || container == null) throw new Error("Invalid view");

const application = new PIXI.Application({
  view,
  antialias: false,
  resolution: window.devicePixelRatio,
  autoDensity: true,
  width: 1600,
  height: 900,
  backgroundColor: 0x000000,
});

PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
PIXI.settings.ROUND_PIXELS = true;

const animationTicker = new AnimationTicker(application);
const furniLoader = new FurnitureLoader();

application.loader
  .add(TileAsset)
  .add(WallAsset)
  .add(Wall2Asset)
  .load(() => init());

function init() {
  const room = new Room(
    parseTileMapString(`
    xxxxxxxxxxxxxxxxxxxxxxxxx
    xxxxxxxxxxx33333333333333
    xxxxxxxxxxx33333333333333
    xxxxxxxxxxx33333333333333
    xxxxxxxxxxx33333333333333
    xxxxxxxxxxx33333333333333
    xxxxxxxxxxx33333333333333
    xxxxxxx333333333333333333
    xxxxxxx333333333333333333
    xxxxxxx333333333333333333
    xxxxxxx333333333333333333
    xxxxxxx333333333333333333
    xxxxxxx333333333333333333
    x4444433333xxxxxxxxxxxxxx
    x4444433333xxxxxxxxxxxxxx
    x44444333333222xx000000xx
    x44444333333222xx000000xx
    xxx44xxxxxxxx22xx000000xx
    xxx33xxxxxxxx11xx000000xx
    xxx33322222211110000000xx
    xxx33322222211110000000xx
    xxxxxxxxxxxxxxxxx000000xx
    xxxxxxxxxxxxxxxxx000000xx
    xxxxxxxxxxxxxxxxx000000xx
    xxxxxxxxxxxxxxxxx000000xx
    xxxxxxxxxxxxxxxxxxxxxxxxx
  `),
    animationTicker,
    furniLoader
  );

  const furnis: Furniture[] = [];

  for (let y = 0; y < 10; y++) {
    for (let x = 10; x < 24; x++) {
      room.addRoomObject(
        new Furniture(`rare_colourable_scifirocket*2`, 0, "1", {
          roomX: x,
          roomY: y,
          roomZ: 3,
        })
      );
    }
  }

  room.addRoomObject(
    new Furniture(`reef_aquarium`, 2, "0", {
      roomX: 6,
      roomY: 6,
      roomZ: 3,
    })
  );

  room.addRoomObject(
    new Furniture(`party_ravel`, 4, "1", {
      roomX: 6,
      roomY: 10,
      roomZ: 3,
    })
  );

  room.addRoomObject(
    new Furniture(`party_ravel`, 4, "0", {
      roomX: 6,
      roomY: 11,
      roomZ: 3,
    })
  );

  room.addRoomObject(
    new Furniture(`party_ravel`, 4, "1", {
      roomX: 6,
      roomY: 12,
      roomZ: 3,
    })
  );

  room.addRoomObject(
    new Furniture(`party_floor`, 0, "1", {
      roomX: 6,
      roomY: 10,
      roomZ: 3,
    })
  );

  room.addRoomObject(
    new Furniture(`party_floor`, 0, "1", {
      roomX: 8,
      roomY: 10,
      roomZ: 3,
    })
  );

  room.addRoomObject(
    new Furniture(`party_floor`, 0, "1", {
      roomX: 10,
      roomY: 10,
      roomZ: 3,
    })
  );

  room.addRoomObject(
    new Furniture(`party_floor`, 0, "1", {
      roomX: 12,
      roomY: 10,
      roomZ: 3,
    })
  );

  room.x = application.screen.width / 2 - room.roomWidth / 2;
  room.y = application.screen.height / 2 - room.roomHeight / 2;

  application.stage.addChild(room);

  /*application.stage.addChild(
    new TileTest({ x: 10, y: 10, tileHeight: 10, xEven: false, yEven: false })
  );
  application.stage.addChild(
    new TileTest({
      x: 10 + 32,
      y: 10 + 16,
      tileHeight: 10,
      xEven: true,
      yEven: false,
    })
  );
  */
}
