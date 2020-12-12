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
    xxx1111111
    xxx1111111
    xxx1111111
    xxx1111111
    xxx0000000
    0000000000
    0000000000
    0000000000
    0000000000
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

const wallFurniture1 = new WallFurniture({
  roomX: 0,
  roomY: 5,
  roomZ: 0,
  direction: 2,
  type: "window_skyscraper",
});

const wallFurniture2 = new WallFurniture({
  roomX: 0,
  roomY: 5,
  roomZ: 2,
  direction: 2,
  type: "window_skyscraper",
});

room.addRoomObject(avatar);
room.addRoomObject(wallFurniture1);
room.addRoomObject(wallFurniture2);
application.stage.addChild(room);

const landscape = new Landscape();
landscape.leftTexture = loadRoomTexture("./images/a1.png");
landscape.rightTexture = loadRoomTexture("./images/a2.png");
landscape.color = "#cccccc";

room.addRoomObject(landscape);
