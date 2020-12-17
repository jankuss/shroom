import {
  loadRoomTexture,
  Room,
  Landscape,
  WallFurniture,
} from "@jankuss/shroom";

import { createShroom } from "./common/createShroom";
import tile from "./assets/tile.png";

export function DefaultRoom() {
  return createShroom(({ application, shroom }) => {
    const room = Room.create(shroom, {
      tilemap: `
        00
        00
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
        1100
        1100
        0000
        0000
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
        22100
        22100
        11000
        00000
        00000
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
        00000
        0x0x0
        00x00
        0x0x0
        00000
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
        xxx000
        xxx000
        xxx000
        000000
        000000
        000000
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
        xxx000
        xxx000
        xxx000
        000000
        000000
        000000
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
        xxx000
        xxx000
        xxx000
        000000
        000000
        000000
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
        xxx000
        xxx000
        xxx000
        000000
        000000
        000000
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
        xxx11100
        xxx11100
        xxx00000
        00000000
        00000000
        00000000
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
        xxx11100
        xxx11100
        xxx00000
        00000000
        00000000
        00000000
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
        xxxx0
        xx000
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

    const landscape = new Landscape();
    landscape.color = "#ffcccc";

    const window1 = new WallFurniture({
      roomX: 0,
      roomY: 2,
      direction: 2,
      roomZ: 0,
      type: "window_skyscraper",
    });

    const window2 = new WallFurniture({
      roomX: 0,
      roomY: 4,
      direction: 2,
      roomZ: 0,
      type: "window_skyscraper",
    });

    const window3 = new WallFurniture({
      roomX: 0,
      roomY: 5,
      direction: 2,
      roomZ: 0,
      type: "window_skyscraper",
    });

    const window4 = new WallFurniture({
      roomX: 0,
      roomY: 2,
      direction: 4,
      roomZ: 0,
      type: "window_skyscraper",
    });

    const window5 = new WallFurniture({
      roomX: 1,
      roomY: 1,
      direction: 2,
      roomZ: 0,
      type: "window_skyscraper",
    });

    const window6 = new WallFurniture({
      roomX: 1,
      roomY: 1,
      direction: 4,
      roomZ: 0,
      type: "window_skyscraper",
    });

    const window7 = new WallFurniture({
      roomX: 2,
      roomY: 1,
      direction: 4,
      roomZ: 0,
      type: "window_skyscraper",
    });

    const window8 = new WallFurniture({
      roomX: 3,
      roomY: 0,
      direction: 2,
      roomZ: 0,
      type: "window_skyscraper",
    });

    const window9 = new WallFurniture({
      roomX: 3,
      roomY: 0,
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

export default {
  title: "Room",
};
