import {
  loadRoomTexture,
  Room,
  Landscape,
  WallFurniture,
  RoomCamera,
} from "@jankuss/shroom";

import { createShroom } from "./common/createShroom";
import tile from "./assets/tile2.png";

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

export function StairCorners() {
  return createShroom(({ application, shroom }) => {
    const room = Room.create(shroom, {
      tilemap: `
        xxxxxxx
        x000000
        x000000
        x001100
        x001100
        x000000
      `,
    });

    room.x = application.screen.width / 2 - room.roomWidth / 2;
    room.y = application.screen.height / 2 - room.roomHeight / 2;

    application.stage.addChild(room);
  });
}

export function StairWalls() {
  return createShroom(({ application, shroom }) => {
    const room = Room.create(shroom, {
      tilemap: `
        xxxxxxxxx
        x44321000
        x44321000
        x33000000
        x22000000
        x11000000
        x00000000
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
        000000000
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
        xxxxxxxxxxxx
        xxxx11100000
        xxxx11100000
        xxxx00000000
        x00000000000
        x00000000000
        x00000000000
        x00000000000
        x00000000000
        x00000000000
        x00000000000
      `,
    });

    const tileTexture = loadRoomTexture(tile);

    room.wallHeight = 128;
    room.tileHeight = 4;
    room.wallDepth = 10;

    room.wallColor = "#f5e4c1";
    room.floorColor = "#eeeeee";
    room.wallTexture = tileTexture;
    room.floorTexture = tileTexture;

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
        xxxxxxxxx
        xxxxx1100
        xxx111100
        xx1111100
        x11111100
        xx1111100
        xx1111000
        xx0000000
        xx0000000
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
      roomX: 1,
      roomY: 6,
      direction: 2,
      offsetX: 16,
      offsetY: 30,
      type: "window_skyscraper",
    });

    room.onActiveWallChange.subscribe((value) => {
      if (value == null) {
        window1.alpha = 0;
        return;
      }

      window1.alpha = 1;
      window1.roomX = value.roomX;
      window1.roomY = value.roomY;
      window1.offsetX = value.offsetX;
      window1.offsetY = value.offsetY;
      window1.direction = value.wall === "l" ? 2 : 4;
    });

    room.addRoomObject(landscape);
    room.addRoomObject(window1);

    application.stage.addChild(room);
  });
}

export function RoomModelTest1() {
  return createShroom(({ application, shroom }) => {
    const room = Room.create(shroom, {
      tilemap: `
      xxxxxxxxxxxxxxxxxxx
      xxxxxxx222222222222
      xxxxxxx222222222222
      xxxxxxx222222222222
      xxxxxxx222222222222
      xxxxxxx222222222222
      xxxxxxx222222222222
      xxxxxxx22222222xxxx
      xxxxxxx11111111xxxx
      x222221111111111111
      x222221111111111111
      x222221111111111111
      x222221111111111111
      x222221111111111111
      x222221111111111111
      x222221111111111111
      x222221111111111111
      x2222xx11111111xxxx
      x2222xx00000000xxxx
      x2222xx000000000000
      x2222xx000000000000
      x2222xx000000000000
      x2222xx000000000000
      22222xx000000000000
      x2222xx000000000000
      xxxxxxxxxxxxxxxxxxx
      `,
    });

    application.stage.addChild(RoomCamera.forScreen(room));
  });
}

export function RoomModelTest2() {
  return createShroom(({ application, shroom }) => {
    const room = Room.create(shroom, {
      tilemap: `
      xxxxxxxxxxxxxxxxxxxx
      x222221111111111111x
      x222221111111111111x
      2222221111111111111x
      x222221111111111111x
      x222221111111111111x
      x222221111111111111x
      xxxxxxxx1111xxxxxxxx
      xxxxxxxx0000xxxxxxxx
      x000000x0000x000000x
      x000000x0000x000000x
      x00000000000x000000x
      x00000000000x000000x
      x000000000000000000x
      x000000000000000000x
      xxxxxxxx00000000000x
      x000000x00000000000x
      x000000x0000xxxxxxxx
      x00000000000x000000x
      x00000000000x000000x
      x00000000000x000000x
      x00000000000x000000x
      xxxxxxxx0000x000000x
      x000000x0000x000000x
      x000000x0000x000000x
      x000000000000000000x
      x000000000000000000x
      x000000000000000000x
      x000000000000000000x
      xxxxxxxxxxxxxxxxxxxx
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

    application.stage.addChild(RoomCamera.forScreen(room));
  });
}

export function HideTileCursor() {
  return createShroom(({ application, shroom }) => {
    const room = Room.create(shroom, {
      tilemap: `
        xxxxxxx
        x000000
        x000000
        x000000
      `,
    });

    room.hideTileCursor = true;

    application.stage.addChild(room);
  });
}

export default {
  title: "Room",
};
