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
  direction: 4,
  roomX: 0,
  roomY: 0,
  roomZ: 0,
});

room.x = application.screen.width / 2 - room.roomWidth / 2;
room.y = application.screen.height / 2 - room.roomHeight / 2;

room.wallTexture = loadRoomTexture("./images/tile.png");
room.floorTexture = loadRoomTexture("./images/tile.png");
room.wallColor = "#dbbe6e";
room.floorColor = "#eeeeee";

room.addRoomObject(avatar);

const testContainer = new PIXI.Graphics();

testContainer.x = room.x;
testContainer.y = room.y;
testContainer.beginFill(0xffffff, 0.1);
testContainer.drawRect(0, 0, room.roomWidth, room.roomHeight);
testContainer.endFill();

application.stage.addChild(RoomCamera.forScreen(room));
// application.stage.addChild(room);
