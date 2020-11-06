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

const animationTicker = new AnimationTicker(application);
const furniLoader = new FurnitureLoader();
const avatarLoader = new AvatarLoader({
  createLookServer: async () => {
    const fetchString = (url: string) =>
      fetch(url).then((response) => response.text());
    const fetchJson = (url: string) =>
      fetch(url).then((response) => response.json());

    return createLookServer({
      drawOrderString: await fetchString("./draworder.xml"),
      figureDataString: await fetchString("./figuredata.xml"),
      figureMapString: await fetchString("./figuremap.xml"),
      loadOffsetMap: async () =>
        loadOffsetMapFromJson(await fetchJson("./offsets.json")).getOffset,
    });
  },
  resolveImage: async (id) => {
    const image = new Image();
    image.src = `./figure/${id}.png`;

    const dimensions = await new Promise<{
      width: number;
      height: number;
    }>((resolve) => {
      image.onload = (value) => {
        resolve({ width: image.width, height: image.height });
      };
    });

    return PIXI.Texture.from(image);
  },
});

application.loader
  .add(TileAsset)
  .add(WallAsset)
  .add(Wall2Asset)
  .load(() => init());

function init() {
  const room = new Room(
    parseTileMapString(`
    000000000000000
    000000000000000
    000000000000000
    000000000000000
    000000000000000
    000000000000000
    000000000000000
    000000000000000
    000000000000000
    000000000000000
  `),
    animationTicker,
    furniLoader,
    avatarLoader
  );

  room.addRoomObject(
    new Furniture("throne", 2, "0", { roomX: 0, roomY: 0, roomZ: 0 })
  );

  for (let y = 0; y < 5; y++) {
    for (let x = 0; x < 10; x++) {
      const avatar = new Avatar(
        "hd-180-1.hr-831-49.ea-1406-62.ch-210-92.cc-3087-108.lg-3057-110",
        "std",
        2,
        { roomX: x, roomY: y, roomZ: 0 }
      );

      room.addRoomObject(avatar);

      avatar.walk(x, y + 1, 0, 4);
      avatar.walk(x, y + 2, 0, 4);
      avatar.walk(x, y + 3, 0, 4);
      avatar.walk(x + 1, y + 3, 0, 2);
      avatar.walk(x + 2, y + 3, 0, 2);
      avatar.walk(x + 2, y + 4, 0, 4);
      avatar.walk(x + 2, y + 5, 0, 4);
    }
  }

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
