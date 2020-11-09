import * as PIXI from "pixi.js";

import { parseTileMapString } from "./util/parseTileMapString";
import { Furniture } from "./objects/furniture/Furniture";
import { AnimationTicker } from "./AnimationTicker";

import TileAsset from "./assets/tile.png";
import WallAsset from "./assets/wall.png";
import Wall2Asset from "./assets/wall2.png";
import { FurnitureLoader } from "./objects/furniture/FurnitureLoader";
import { Room } from "./objects/room/Room";
import { WallFurniture } from "./objects/furniture/WallFurniture";
import { AvatarLoader } from "./objects/avatar/AvatarLoader";
import { createLookServer, loadOffsetMapFromJson } from "./objects/avatar/util";
import { Avatar } from "./objects/avatar/Avatar";

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

application.loader
  .add(TileAsset)
  .add(WallAsset)
  .add(Wall2Asset)
  .load(() => init());

function init() {
  const room = Room.create({
    application,
    tilemap: `
      00000
      00000
      00000
      00000
      00000
      00000
    `,
  });

  room.x = application.screen.width / 2 - room.roomWidth / 2;
  room.y = application.screen.height / 2 - room.roomHeight / 2;

  room.addRoomObject(
    new Furniture({
      type: "throne",
      direction: 2,
      roomX: 0,
      roomY: 0,
      roomZ: 0,
    })
  );

  const avatar = new Avatar({
    look:
      "hd-208-1.hr-145-61.ha-1009-93.ea-1406-62.ch-255-66.lg-285-1422.sh-290-1325",
    direction: 2,
    roomX: 0,
    roomY: 0,
    roomZ: 0,
  });

  avatar.action = "std";
  avatar.waving = false;
  avatar.direction = 2;
  avatar.drinking = false;

  setTimeout(() => {
    avatar.walk(1, 0, 0, { direction: 2 });
    avatar.walk(2, 0, 0, { direction: 2 });
    avatar.walk(3, 0, 0, { direction: 2 });

    avatar.walk(3, 1, 0, { direction: 4 });
    avatar.walk(3, 2, 0, { direction: 4 });
    avatar.walk(3, 3, 0, { direction: 4 });

    avatar.walk(2, 3, 0, { direction: 6 });
    avatar.walk(1, 3, 0, { direction: 6 });
    avatar.walk(0, 3, 0, { direction: 6 });
  }, 5000);

  room.addRoomObject(avatar);

  application.stage.addChild(room);

  createButton("Turn", () => {
    avatar.direction = (avatar.direction + 1) % 8;
  });

  createButton("Walk", () => {
    avatar.action = "wlk";
  });

  createButton("Lay", () => {
    avatar.action = "lay";
  });

  createButton("Sit", () => {
    avatar.action = "sit";
  });

  createButton("Wave", () => {
    avatar.waving = !avatar.waving;
  });
}

function createButton(label: string, onClick: () => void) {
  const button = document.createElement("button");
  button.innerText = label;
  button.addEventListener("click", onClick);
  document.body.appendChild(button);
}
