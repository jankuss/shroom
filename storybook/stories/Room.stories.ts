import {
  loadRoomTexture,
  Room,
  Landscape,
  WallFurniture,
  RoomCamera,
} from "@jankuss/shroom";

import { createShroom } from "./common/createShroom";
import tile from "./assets/tile.png";

export function DefaultRoom() {
  return createShroom(({ application, shroom }) => {
    const room = Room.create(shroom, {
      tilemap: `
        xxx
        x00
        x00
      `,
    });

    room.x = application.screen.width / 2 - room.roomWidth / 2;
    room.y = application.screen.height / 2 - room.roomHeight / 2;

    application.stage.addChild(room);
  });
}

export function Stairs() {
  return createShroom(({ application, shroom }) => {
    const room = Room.create(shroom, {
      tilemap: `
        xxxxx
        x1100
        x1100
        x0000
        x0000
      `,
    });

    room.x = application.screen.width / 2 - room.roomWidth / 2;
    room.y = application.screen.height / 2 - room.roomHeight / 2;

    application.stage.addChild(room);
  });
}

export function MultipleSubsequentStairs() {
  return createShroom(({ application, shroom }) => {
    const room = Room.create(shroom, {
      tilemap: `
        xxxxxx
        x22100
        x22100
        x11000
        x00000
        x00000
      `,
    });

    room.x = application.screen.width / 2 - room.roomWidth / 2;
    room.y = application.screen.height / 2 - room.roomHeight / 2;

    application.stage.addChild(room);
  });
}

export function Holes() {
  return createShroom(({ application, shroom }) => {
    const room = Room.create(shroom, {
      tilemap: `
        xxxxxx
        x00000
        x0x0x0
        x00x00
        x0x0x0
        x00000
      `,
    });

    room.x = application.screen.width / 2 - room.roomWidth / 2;
    room.y = application.screen.height / 2 - room.roomHeight / 2;

    application.stage.addChild(room);
  });
}

export function AngledRoom() {
  return createShroom(({ application, shroom }) => {
    const room = Room.create(shroom, {
      tilemap: `
        xxxxxxx
        xxxx000
        xxxx000
        xxxx000
        x000000
        x000000
        x000000
      `,
    });

    room.x = application.screen.width / 2 - room.roomWidth / 2;
    room.y = application.screen.height / 2 - room.roomHeight / 2;

    application.stage.addChild(room);
  });
}

export function HiddenWalls() {
  return createShroom(({ application, shroom }) => {
    const room = Room.create(shroom, {
      tilemap: `
        xxxxxxx
        xxxx000
        xxxx000
        xxxx000
        x000000
        x000000
        x000000
      `,
    });

    room.x = application.screen.width / 2 - room.roomWidth / 2;
    room.y = application.screen.height / 2 - room.roomHeight / 2;
    room.hideWalls = true;

    application.stage.addChild(room);
  });
}

export function TileTexture() {
  return createShroom(({ application, shroom }) => {
    const room = Room.create(shroom, {
      tilemap: `
        xxxxxxx
        xxxx000
        xxxx000
        xxxx000
        x000000
        x000000
        x000000
      `,
    });

    room.floorTexture = loadRoomTexture(tile);

    room.x = application.screen.width / 2 - room.roomWidth / 2;
    room.y = application.screen.height / 2 - room.roomHeight / 2;

    application.stage.addChild(room);
  });
}

export function WallTexture() {
  return createShroom(({ application, shroom }) => {
    const room = Room.create(shroom, {
      tilemap: `
        xxxxxxx
        xxxx000
        xxxx000
        xxxx000
        x000000
        x000000
        x000000
      `,
    });

    room.wallTexture = loadRoomTexture(tile);

    room.x = application.screen.width / 2 - room.roomWidth / 2;
    room.y = application.screen.height / 2 - room.roomHeight / 2;

    application.stage.addChild(room);
  });
}

export function CustomLook() {
  return createShroom(({ application, shroom }) => {
    const room = Room.create(shroom, {
      tilemap: `
        xxxxxxxxx
        xxxx11100
        xxxx11100
        xxxx00000
        x00000000
        x00000000
        x00000000
      `,
    });

    const tileTexture = loadRoomTexture(tile);
    room.wallTexture = tileTexture;
    room.floorTexture = tileTexture;

    room.wallHeight = 128;
    room.tileHeight = 2;
    room.wallDepth = 2;

    room.x = application.screen.width / 2 - room.roomWidth / 2;
    room.y = application.screen.height / 2 - room.roomHeight / 2;

    application.stage.addChild(room);
  });
}

export function CustomColor() {
  return createShroom(({ application, shroom }) => {
    const room = Room.create(shroom, {
      tilemap: `
        xxxxxxxxx
        xxxx11100
        xxxx11100
        xxxx00000
        x00000000
        x00000000
        x00000000
      `,
    });

    const tileTexture = loadRoomTexture(tile);
    room.wallTexture = tileTexture;
    room.floorTexture = tileTexture;

    room.wallHeight = 128;
    room.tileHeight = 2;
    room.wallDepth = 2;
    room.wallColor = "#cceeee";
    room.floorColor = "#f3f3f3";

    room.x = application.screen.width / 2 - room.roomWidth / 2;
    room.y = application.screen.height / 2 - room.roomHeight / 2;

    application.stage.addChild(room);
  });
}

export function Door() {
  return createShroom(({ application, shroom }) => {
    const room = Room.create(shroom, {
      tilemap: `
        xxxxx
        x0000
        00000
        x0000
        x0000
      `,
    });

    const tileTexture = loadRoomTexture(tile);
    room.wallTexture = tileTexture;
    room.floorTexture = tileTexture;

    room.x = application.screen.width / 2 - room.roomWidth / 2;
    room.y = application.screen.height / 2 - room.roomHeight / 2;

    application.stage.addChild(room);
  });
}

export function LandscapeColor() {
  return createShroom(({ application, shroom }) => {
    const room = Room.create(shroom, {
      tilemap: `
        xxxxxx
        xxxxx0
        xxx000
        xx0000
        x00000
        xx0000
        xx0000
      `,
    });

    const tileTexture = loadRoomTexture(tile);
    room.wallTexture = tileTexture;
    room.floorTexture = tileTexture;

    room.x = application.screen.width / 2 - room.roomWidth / 2;
    room.y = application.screen.height / 2 - room.roomHeight / 2;

    const landscape = new Landscape();
    landscape.color = "#ffcccc";

    const window1 = new WallFurniture({
      roomX: 2,
      roomY: 3,
      direction: 2,
      roomZ: 0,
      type: "window_skyscraper",
    });

    const window2 = new WallFurniture({
      roomX: 2,
      roomY: 5,
      direction: 2,
      roomZ: 0,
      type: "window_skyscraper",
    });

    const window3 = new WallFurniture({
      roomX: 2,
      roomY: 6,
      direction: 2,
      roomZ: 0,
      type: "window_skyscraper",
    });

    const window4 = new WallFurniture({
      roomX: 2,
      roomY: 3,
      direction: 4,
      roomZ: 0,
      type: "window_skyscraper",
    });

    const window5 = new WallFurniture({
      roomX: 3,
      roomY: 2,
      direction: 2,
      roomZ: 0,
      type: "window_skyscraper",
    });

    const window6 = new WallFurniture({
      roomX: 3,
      roomY: 2,
      direction: 4,
      roomZ: 0,
      type: "window_skyscraper",
    });

    const window7 = new WallFurniture({
      roomX: 4,
      roomY: 2,
      direction: 4,
      roomZ: 0,
      type: "window_skyscraper",
    });

    const window8 = new WallFurniture({
      roomX: 5,
      roomY: 1,
      direction: 2,
      roomZ: 0,
      type: "window_skyscraper",
    });

    const window9 = new WallFurniture({
      roomX: 5,
      roomY: 1,
      direction: 4,
      roomZ: 0,
      type: "window_skyscraper",
    });

    room.addRoomObject(landscape);
    room.addRoomObject(window1);
    room.addRoomObject(window2);
    room.addRoomObject(window3);
    room.addRoomObject(window4);
    room.addRoomObject(window5);
    room.addRoomObject(window6);
    room.addRoomObject(window7);
    room.addRoomObject(window8);
    room.addRoomObject(window9);

    application.stage.addChild(room);
  });
}

export function FunkyRoomShape() {
  return createShroom(({ application, shroom }) => {
    const room = Room.create(shroom, {
      tilemap: `
      xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
      xxxxxxxxxxxxxxxxxxxxxxx000000000xx
      xxxxxxxxxxxxxxxxxxxxxxx000000000xx
      xxxxxxxxxxxxxxxxxxxxxxx000000000xx
      xxxxxxxxxxxxxxxxxxxxxxx000000000xx
      xxxxxxxxxxxxxxxxxxxxxxx000000000xx
      xxxxxxxxxxxxxxxxxxxxxxx000000000xx
      xxxxxxxxxxxxxxxxxxxxxxx000000000xx
      xxxxxxxxxxxxxxxxxxxxxxx000000000xx
      xxxxxxxxxxxxxxxxxxxxxxxx00000000xx
      xxxxxxxxxxxxxxxxxxxxxxxxx0000000xx
      xxxxxxxxxxxxxxxxxxxxx00000000xxxxx
      xxxxxxxxxxxxxxxxxxxxx00000000xxxxx
      xxxxxxxxxxxxxxxxxxxxx00000000xxxxx
      xxxxxxxxxxxxxxxxxxxx000000000xxxxx
      xxxxxxxxxxxxxxxxxxxx000000000xxxxx
      xxxxxxxxxxxxxxxxxxxxx00000000xxxxx
      xxxxxxxxxxxxxxxxxxxxx00000000xxxxx
      xxxxxxxxxxxxxxxxxxxxx000000000000x
      xxxxxxxxxxxxxxxxxxxxx000000000000x
      xxxxxxxxxxxxxxxxxxxxx000000000000x
      x00000000xxxxxxxxxxxx000000000000x
      x00000000xxxxxxxxxxxx0000000000000
      x00000000xxxxxxxxxxxx0000000000000
      x00000000xxxxxxxxxxxx000000000000x
      x00000000xxxxxxxxxxxx000000000000x
      x00000000xxxxxxxxxxxx000000000000x
      x00000000xxxxxxxxxxxx000000000000x
      x00000000xxxxxxxxxxxx00000000xxxxx
      xxxx00xxxxxxxxxxxxxxx00000000xxxxx
      xxxxxxxxxxxxxxxxxxxxx00000000xxxxx
      xxxxxxxxxxxxxxxxxxxxx00000000xxxxx
      xxxxxxxxxxxxxxxxxxxxx00000000xxxxx
      xxxxxxxxxxxxxxxxxxxxx00000000xxxxx
      xxxx0xxxxxxxxxxxxxxxxx00xxxxxxxxxx
      xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
      xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
      xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
      xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
      xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
      xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
      xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
      xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
      `,
    });

    application.stage.addChild(RoomCamera.forScreen(room));
  });
}

export function OtherRoomShape() {
  return createShroom(({ application, shroom }) => {
    const room = Room.create(shroom, {
      tilemap: `
        xxxxxxx
        xxxx000
        xxxx000
        xxxxx00
        xxxxx00
        0000000
        x000000
      `,
    });

    const camera = RoomCamera.forScreen(room);

    camera.onOffsetChange = (offsets) => {
      console.log(offsets);
    };

    application.stage.addChild(camera);
  });
}

export default {
  title: "Room",
};
