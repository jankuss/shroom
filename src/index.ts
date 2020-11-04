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
    return PIXI.Texture.from(`./figure/${id}.png`);
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
    000
    000
    000
  `),
    animationTicker,
    furniLoader,
    avatarLoader
  );

  const furnis: Furniture[] = [];
  room.addRoomObject(
    new Furniture(`throne`, 2, "0", {
      roomX: 0,
      roomY: 0,
      roomZ: 0,
    })
  );

  room.addRoomObject(
    new WallFurniture(`window_nt_skyscraper`, 2, "0", {
      roomX: 0,
      roomY: 0,
      roomZ: 0,
    })
  );

  room.addRoomObject(
    new WallFurniture(`window_nt_skyscraper`, 2, "0", {
      roomX: 0,
      roomY: 1,
      roomZ: 0,
    })
  );

  room.addRoomObject(
    new WallFurniture(`window_nt_skyscraper`, 2, "0", {
      roomX: 0,
      roomY: 2,
      roomZ: 0,
    })
  );

  room.addRoomObject(
    new Avatar(
      "hd-180-1.hr-3260-61.ch-215-1430.cc-3326-62.lg-270-110.sh-305-62.wa-2011-62",
      "sit",
      2,
      { roomX: 0, roomY: 0, roomZ: 0 }
    )
  );

  room.addRoomObject(
    new Avatar(
      "hd-628-2.hr-890-55.fa-1203-110.ch-3135-66.cc-3157-1328.lg-3174-1327.sh-3419-110",
      "std",
      2,
      { roomX: 0, roomY: 1, roomZ: 0 }
    )
  );

  room.addRoomObject(
    new Avatar(
      "hd-605-2.hr-3012-45.ch-645-109.lg-720-63.sh-725-92.wa-2001-62",
      "std",
      2,
      { roomX: 0, roomY: 2, roomZ: 0 }
    )
  );

  room.addRoomObject(
    new Avatar(
      "hd-180-1.hr-831-49.ea-1406-62.ch-210-92.cc-3087-108.lg-3057-110",
      "std",
      2,
      { roomX: 1, roomY: 0, roomZ: 0 }
    )
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
