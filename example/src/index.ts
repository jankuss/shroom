import * as PIXI from "pixi.js";

import {
  Room,
  FloorFurniture,
  Avatar,
  Shroom,
  loadRoomTexture,
  WallFurniture,
  Landscape,
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
    000000000
    000000000
    000000000
    000000000
    000000000
    000000000
    000000000
    000000000
  `,
});

const avatar = new Avatar({
  look: "hd-180-1.hr-100-61.ch-210-66.lg-280-110.sh-305-62",
  direction: 2,
  roomX: 0,
  roomY: 1,
  roomZ: 0,
});

room.x = application.screen.width / 2 - room.roomWidth / 2;
room.y = application.screen.height / 2 - room.roomHeight / 2;

room.wallTexture = loadRoomTexture("./images/tile.png");
room.floorTexture = loadRoomTexture("./images/tile.png");
room.wallColor = "#dbbe6e";
room.floorColor = "#eeeeee";

const furniture1 = new FloorFurniture({
  roomX: 0,
  roomY: 0,
  roomZ: 0,
  direction: 2,
  type: "exe_table",
});

const furniture2 = new FloorFurniture({
  roomX: 2,
  roomY: 0,
  roomZ: 0,
  direction: 2,
  type: "exe_table",
});

const furniture3 = new FloorFurniture({
  roomX: 4,
  roomY: 0,
  roomZ: 0,
  direction: 2,
  type: "exe_table",
});

const wallFurniture1 = new WallFurniture({
  roomX: 0,
  roomY: 1,
  roomZ: 0,
  direction: 2,
  type: "window_hole",
});

const wallFurniture2 = new WallFurniture({
  roomX: 0,
  roomY: 3,
  roomZ: 0,
  direction: 2,
  type: "window_70s_wide",
});

const wallFurniture3 = new WallFurniture({
  roomX: 0,
  roomY: 5.5,
  roomZ: 0,
  direction: 2,
  type: "window_grunge",
});

const wallFurniture4 = new WallFurniture({
  roomX: 1,
  roomY: 0,
  roomZ: 0,
  direction: 4,
  type: "window_diner",
});

const wallFurniture5 = new WallFurniture({
  roomX: 5,
  roomY: 0,
  roomZ: 0,
  direction: 4,
  type: "sf_window",
  animation: "1",
});

room.addRoomObject(avatar);
room.addRoomObject(furniture1);
room.addRoomObject(wallFurniture1);
room.addRoomObject(wallFurniture2);
room.addRoomObject(wallFurniture3);
room.addRoomObject(wallFurniture4);
room.addRoomObject(wallFurniture5);
room.addRoomObject(furniture2);
room.addRoomObject(furniture3);

application.stage.addChild(room);

const landscape = new Landscape();
landscape.leftTexture = loadRoomTexture("./images/a1.png");
landscape.rightTexture = loadRoomTexture("./images/a2.png");

room.addRoomObject(landscape);
