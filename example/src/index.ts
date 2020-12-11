import * as PIXI from "pixi.js";

import {
  Room,
  FloorFurniture,
  Avatar,
  Shroom,
  loadRoomTexture,
  WallFurniture,
} from "@jankuss/shroom";
import { DummyRoom } from "./DummyRoom";

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

const shroom = Shroom.create({ application, resourcePath: "./resources" });
const room = Room.create(shroom, {
  tilemap: `
    0000
    0000
    0000
   `,
});

const avatar = new Avatar({
  look: "hd-180-1.hr-100-61.ch-210-66.lg-280-110.sh-305-62",
  direction: 2,
  roomX: 0,
  roomY: 1,
  roomZ: 0,
});

room.x = 100;
room.y = 200;

room.wallTexture = loadRoomTexture("./images/tile.png");
room.floorTexture = loadRoomTexture("./images/tile.png");
room.wallColor = "#dbbe6e";
room.floorColor = "#eeeeee";

const furniture = new FloorFurniture({
  roomX: 2,
  roomY: 0,
  direction: 2,
  roomZ: 0,
  type: "exe_table",
  animation: "1",
});

const wallFurniture1 = new WallFurniture({
  roomX: 0,
  roomY: 2,
  roomZ: 0,
  direction: 2,
  type: "window_skyscraper",
});

const wallFurniture2 = new WallFurniture({
  roomX: 0,
  roomY: 1,
  roomZ: 0,
  direction: 2,
  type: "window_skyscraper",
});

const wallFurniture3 = new WallFurniture({
  roomX: 0,
  roomY: 0,
  roomZ: 0,
  direction: 2,
  type: "window_skyscraper",
});

const wallFurniture4 = new WallFurniture({
  roomX: 1.5,
  roomY: 0,
  roomZ: 0,
  direction: 4,
  type: "window_triple",
});

room.addRoomObject(avatar);
//room.addRoomObject(furniture);
room.addRoomObject(wallFurniture1);
room.addRoomObject(wallFurniture2);
room.addRoomObject(wallFurniture3);
room.addRoomObject(wallFurniture4);

application.stage.addChild(room);
