import * as PIXI from "pixi.js";

import {
  Room,
  Avatar,
  FloorFurniture,
  RoomCamera,
  Shroom,
  loadRoomTexture,
} from "@jankuss/shroom";

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
  width: 1200,
  height: 900,
  backgroundColor: 0x000000,
});

PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

const shroom = Shroom.create({
  application,
  resourcePath: "./resources",
  configuration: { placeholder: PIXI.Texture.from("./image.png") },
});
const room = Room.create(shroom, {
  tilemap: `
   xxxxx
   x0000
   x0000
   x0000
   `,
});

const avatar = new Avatar({
  look: "hd-180-1.hr-100-61.ch-210-66.lg-280-110.sh-305-62",
  direction: 4,
  roomX: 0,
  roomY: 0,
  roomZ: 0,
});

room.x = 200;
room.y = 200;

room.wallTexture = loadRoomTexture("./images/tile.png");
room.floorTexture = loadRoomTexture("./images/tile.png");
room.wallColor = "#dbbe6e";
room.floorColor = "#eeeeee";

room.addRoomObject(avatar);
application.stage.addChild(RoomCamera.forScreen(room));
