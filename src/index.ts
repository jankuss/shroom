import * as PIXI from "pixi.js";
import { parseTileMapString } from "./util/parseTileMapString";
import { Room } from "./Room";
import { Furniture } from "./Furniture";
import { FurnitureLoader } from "./FurnitureLoader";
import { AnimationTicker } from "./AnimationTicker";

import TileAsset from "./assets/tile.png";
import WallAsset from "./assets/wall.png";
import Wall2Asset from "./assets/wall2.png";

const view = document.querySelector("#root") as HTMLCanvasElement | undefined;
const container = document.querySelector("#container") as
  | HTMLDivElement
  | undefined;
if (view == null || container == null) throw new Error("Invalid view");

PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
const application = new PIXI.Application({
  view,
  antialias: false,
  resolution: window.devicePixelRatio,
  autoDensity: true,
  width: 1200,
  height: 800,
  backgroundColor: 0x000000,
});

const animationTicker = new AnimationTicker(application);
const furniLoader = new FurnitureLoader();

console.log(TileAsset, WallAsset);

application.loader
  .add(TileAsset)
  .add(WallAsset)
  .add(Wall2Asset)
  .load(() => init());

function init() {
  const room = new Room(
    parseTileMapString(`
    xxx111111
    xxx111111
    xxx111111
    xxx111111    
    xxx111111
    xxx000000
    xxx000000
    000000000
    000000000
    000000000
    000000000
  `)
  );

  const furnis: Furniture[] = [];

  room.addRoomObject(
    new Furniture(animationTicker, furniLoader, `rare_dragonlamp*1`, 2, "1", {
      roomX: 0,
      roomY: 7,
      roomZ: 0,
    })
  );

  room.addRoomObject(
    new Furniture(animationTicker, furniLoader, "hween10_fog", 0, "0", {
      roomX: 3,
      roomY: 7,
      roomZ: 0,
    })
  );

  room.addRoomObject(
    new Furniture(
      animationTicker,
      furniLoader,
      "rare_colourable_scifirocket*2",
      0,
      "1",
      {
        roomX: 8,
        roomY: 7,
        roomZ: 0,
      }
    )
  );

  const directions = [0, 2, 4, 6];
  let index = 0;

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
