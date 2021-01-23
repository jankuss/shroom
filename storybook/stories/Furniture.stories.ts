import * as PIXI from "pixi.js";

import {
  AnimatedFurnitureVisualization,
  Avatar,
  AvatarAction,
  BaseFurniture,
  BasicFurnitureVisualization,
  FloorFurniture,
  FurnitureBottleVisualization,
  FurnitureGuildCustomizedVisualization,
  FurnitureLoader,
  IFurniture,
  Room,
  WallFurniture,
} from "@jankuss/shroom";
import { createShroom } from "./common/createShroom";
import { action } from "@storybook/addon-actions";
import fetch from "node-fetch";

export default {
  title: "Furniture",
};

export function Default() {
  return createShroom(({ application, shroom }) => {
    const room = Room.create(shroom, {
      tilemap: `
       xxxxxxxxxxx
       x0000000000
       x0000000000
       x0000000000
       x0000000000
      `,
    });

    room.x = application.screen.width / 2 - room.roomWidth / 2;
    room.y = application.screen.height / 2 - room.roomHeight / 2;

    for (let i = 0; i < 4; i++) {
      const furniture = new FloorFurniture({
        roomX: 1 + i * 3,
        roomY: 1,
        roomZ: 0,
        type: "club_sofa",
        direction: i * 2,
      });

      furniture.onClick = action(`Furniture ${i} clicked`);
      furniture.onDoubleClick = action(`Furniture ${i} Double Clicked`);
      furniture.validDirections.then(action(`Furniture ${i} valid directions`));

      room.addRoomObject(furniture);
    }

    const test1 = new FloorFurniture({
      roomX: 3,
      roomY: 3,
      roomZ: 0,
      id: 1626,
      direction: 2,
    });

    const test2 = new FloorFurniture({
      roomX: 3,
      roomY: 3,
      roomZ: 0,
      id: 285,
      direction: 2,
    });

    test1.onClick = () => {
      console.log("Clicked");
    };
    test1.onDoubleClick = () => {
      console.log("Double Clicked");
    };

    room.onTileClick = (position) => console.log(position);
    room.addRoomObject(test1);
    room.addRoomObject(test2);

    const dice = new FloorFurniture({
      roomX: 1,
      roomY: 3,
      roomZ: 0,
      type: "edice",
      direction: 0,
      animation: "0",
    });

    dice.extradata.then(action("Extra Data"));
    dice.validDirections.then(action(`Dice valid directions`));

    room.addRoomObject(dice);

    application.stage.addChild(room);
  });
}

export function Animated() {
  return createShroom(({ application, shroom }) => {
    const room = Room.create(shroom, {
      tilemap: `
        xxxxxxxxxxx
        x0000000000
        x0000000000
        x0000000000
        x0000000000
      `,
    });

    room.x = application.screen.width / 2 - room.roomWidth / 2;
    room.y = application.screen.height / 2 - room.roomHeight / 2;

    for (let i = 0; i < 4; i++) {
      const direction = i <= 1 ? 2 : 4;
      const animation = i % 2 === 0 ? "0" : "1";

      const furniture = new FloorFurniture({
        roomX: 1 + i,
        roomY: 1 + i,
        roomZ: 0,
        type: `rare_dragonlamp*${i}`,
        direction,
        animation,
      });

      furniture.onClick = action(`Furniture ${i} clicked`);
      furniture.onDoubleClick = () => {
        action(`Furniture ${i} double clicked`)();
        if (furniture.animation === "0") {
          furniture.animation = "1";
        } else {
          furniture.animation = "0";
        }
      };
      /*
      if (i === 0) {
        room.onActiveTileChange.subscribe((value) => {
          if (value == null) return;

          furniture.roomX = value.roomX;
          furniture.roomY = value.roomY;
          furniture.roomZ = value.roomZ;
        });
      }*/

      room.addRoomObject(furniture);
    }

    application.stage.addChild(room);
  });
}

export function Movement() {
  return createShroom(({ application, shroom }) => {
    const room = Room.create(shroom, {
      tilemap: `
        xxxxxxxxxxx
        x0000000000
        x0000000000
        x0000000000
        x0000000000
      `,
    });

    room.x = application.screen.width / 2 - room.roomWidth / 2;
    room.y = application.screen.height / 2 - room.roomHeight / 2;
    const furniture = new FloorFurniture({
      roomX: 1,
      roomY: 1,
      roomZ: 0,
      type: `rare_dragonlamp*1`,
      direction: 2,
      animation: "1",
    });

    setTimeout(() => {
      furniture.move(1, 2, 0);
    }, 2000);

    setTimeout(() => {
      furniture.move(2, 2, 0);
      furniture.move(3, 2, 0);
    }, 4000);

    room.addRoomObject(furniture);

    application.stage.addChild(room);
  });
}

export function Highlighted() {
  return createShroom(({ application, shroom }) => {
    const room = Room.create(shroom, {
      tilemap: `
       xxxxxxxxxxx
       x0000000000
       x0000000000
       x0000000000
       x0000000000
      `,
    });

    room.x = application.screen.width / 2 - room.roomWidth / 2;
    room.y = application.screen.height / 2 - room.roomHeight / 2;

    const furniture1 = new FloorFurniture({
      roomX: 1,
      roomY: 1,
      roomZ: 0,
      type: "rare_dragonlamp*1",
      direction: 2,
    });

    const furniture2 = new FloorFurniture({
      roomX: 3,
      roomY: 1,
      roomZ: 0,
      type: "club_sofa",
      direction: 4,
    });

    furniture1.highlight = true;
    furniture2.highlight = true;

    furniture1.onClick = () => {
      furniture1.highlight = !furniture1.highlight;
    };

    furniture2.onClick = () => {
      furniture2.highlight = !furniture2.highlight;
    };

    room.addRoomObject(furniture1);
    room.addRoomObject(furniture2);

    application.stage.addChild(room);
  });
}

export function AlphaFurniture() {
  return createShroom(({ application, shroom }) => {
    const room = Room.create(shroom, {
      tilemap: `
       xxxxxxxxxxx
       x0000000000
       x0000000000
       x0000000000
       x0000000000
      `,
    });

    room.x = application.screen.width / 2 - room.roomWidth / 2;
    room.y = application.screen.height / 2 - room.roomHeight / 2;

    const furniture1 = new FloorFurniture({
      roomX: 1,
      roomY: 1,
      roomZ: 0,
      type: "rare_dragonlamp*1",
      direction: 2,
    });

    const furniture2 = new FloorFurniture({
      roomX: 3,
      roomY: 1,
      roomZ: 0,
      type: "club_sofa",
      direction: 4,
    });

    furniture1.alpha = 0.5;
    furniture2.alpha = 0.25;

    room.addRoomObject(furniture1);
    room.addRoomObject(furniture2);

    application.stage.addChild(room);
  });
}

export function MultipleFurnitures() {
  return createShroom(({ application, shroom }) => {
    const room = Room.create(shroom, {
      tilemap: `
       xxxxxxxxxxx
       x0000000000
       x0000000000
       x0000000000
       x0000000000
       x0000000000
       x0000000000
       x0000000000
       x0000000000
      `,
    });

    room.x = application.screen.width / 2 - room.roomWidth / 2;
    room.y = application.screen.height / 2 - room.roomHeight / 2;

    const furnis: FloorFurniture[] = [];

    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 5; x++) {
        const id = y * 10 + x;

        const furni = new FloorFurniture({
          roomX: 1 + x * 2,
          roomY: 1 + y * 2,
          roomZ: 0,
          direction: 0,
          id: id + 1800,
        });

        room.addRoomObject(furni);

        furnis.push(furni);
      }
    }

    setTimeout(() => {
      furnis.forEach((furni) => furni.move(furni.roomX, furni.roomY + 1, 0));
    }, 2500);

    application.stage.addChild(room);
  });
}

export function DifferentFetchTypes() {
  return createShroom(({ application, shroom }) => {
    const room = Room.create(shroom, {
      tilemap: `
       xxxxxxxxxxx
       x0000000000
       x0000000000
       x0000000000
       x0000000000
       x0000000000
       x0000000000
       x0000000000
       x0000000000
      `,
    });

    room.x = application.screen.width / 2 - room.roomWidth / 2;
    room.y = application.screen.height / 2 - room.roomHeight / 2;

    const wallFurniture = new WallFurniture({
      id: 4054,
      direction: 2,
      roomX: 1,
      roomY: 1,
      offsetX: 0,
      offsetY: 0,
    });
    const floorFurniture = new FloorFurniture({
      id: 4054,
      direction: 2,
      roomX: 1,
      roomY: 1,
      roomZ: 0,
    });

    room.addRoomObject(wallFurniture);
    room.addRoomObject(floorFurniture);

    application.stage.addChild(room);
  });
}

export function DetachedFurniture() {
  return createShroom(({ application, shroom }) => {
    const container = new PIXI.Container();
    container.sortableChildren = true;

    application.stage.addChild(container);

    const furniture = BaseFurniture.fromShroom(shroom, container, {
      animation: "0",
      direction: 2,
      type: { type: "club_sofa", kind: "type" },
      onLoad: () => {
        console.log("Club Sofa Loaded");
      },
    });

    furniture.x = 100;
    furniture.y = 100;
  });
}

export function GldGate() {
  return createShroom(({ application, shroom }) => {
    const container = new PIXI.Container();
    application.stage.addChild(container);

    const room = Room.create(shroom, {
      tilemap: `
           xxxxxxxxxxx
           x0000000000
           x0000000000
           x0000000000
           x0000000000
           x0000000000
           x0000000000
           x0000000000
           x0000000000
          `,
    });

    room.x = application.screen.width / 2 - room.roomWidth / 2;
    room.y = application.screen.height / 2 - room.roomHeight / 2;

    const floorFurniture2 = new FloorFurniture({
      type: "bottle",
      direction: 0,
      roomX: 1,
      roomY: 3,
      roomZ: 0,
      animation: "0",
    });

    let b = false;

    const floorFurniture3 = new FloorFurniture({
      type: "gld_gate",
      direction: 2,
      roomX: 1,
      roomY: 5,
      roomZ: 0,
      animation: "0",
    });

    const handleVisualization = (
      furniture: IFurniture,
      visualization: string | undefined
    ) => {
      switch (visualization) {
        case "furniture_guild_customized":
          furniture.visualization = new FurnitureGuildCustomizedVisualization({
            primaryColor: "ff0000",
            secondaryColor: "ffff00",
          });
          break;

        case "furniture_bottle":
          furniture.visualization = new FurnitureBottleVisualization();
          break;
      }
    };

    floorFurniture3.extradata.then(({ visualization }) =>
      handleVisualization(floorFurniture3, visualization)
    );

    floorFurniture2.extradata.then(({ visualization }) => {
      handleVisualization(floorFurniture2, visualization);
    });

    let spinning = false;
    floorFurniture2.onClick = () => {
      if (spinning) {
        floorFurniture2.animation = "3";
        spinning = false;
      } else {
        spinning = true;
        floorFurniture2.animation = "-1";
      }
    };

    floorFurniture3.onClick = () => {
      b = !b;
      console.log("CHANGE");

      if (b) {
        floorFurniture3.animation = "1";
      } else {
        floorFurniture3.animation = "0";
      }
    };

    room.addRoomObject(floorFurniture2);
    room.addRoomObject(floorFurniture3);

    application.stage.addChild(room);
  });
}

export function TileCursorFloorItems() {
  return createShroom(({ application, shroom }) => {
    const container = new PIXI.Container();
    application.stage.addChild(container);

    const room = Room.create(shroom, {
      tilemap: `
       xxxxxxxxxxx
       x0000000000
       x0000000000
       x0000000000
       x0000000000
       x0000000000
       x0000000000
       x0000000000
       x0000000000
      `,
    });

    const furniture = new FloorFurniture({
      roomX: 1,
      roomY: 1,
      roomZ: 0,
      animation: "0",
      direction: 2,
      type: "lc_glass_floor",
    });

    const furniture2 = new FloorFurniture({
      roomX: 1,
      roomY: 1,
      roomZ: 0,
      animation: "0",
      direction: 4,
      type: "club_sofa",
    });

    room.x = application.screen.width / 2 - room.roomWidth / 2;
    room.y = application.screen.height / 2 - room.roomHeight / 2;
    room.addRoomObject(furniture);
    room.addRoomObject(furniture2);
    application.stage.addChild(room);
  });
}

export function ValidDirections() {
  return createShroom(({ application, shroom }) => {
    const container = new PIXI.Container();
    application.stage.addChild(container);

    const room = Room.create(shroom, {
      tilemap: `
       xxxxxxxxxxx
       x0000000000
       x0000000000
       x0000000000
       x0000000000
       x0000000000
       x0000000000
       x0000000000
       x0000000000
      `,
    });

    const furniture1 = new FloorFurniture({
      roomX: 1,
      roomY: 1,
      roomZ: 0,
      animation: "0",
      direction: 2,
      id: 8434,
    });

    const furniture2 = new FloorFurniture({
      roomX: 1,
      roomY: 3,
      roomZ: 0,
      animation: "0",
      direction: 4,
      id: 8434,
    });

    const furniture3 = new FloorFurniture({
      roomX: 1,
      roomY: 5,
      roomZ: 0,
      animation: "0",
      direction: 6,
      id: 8434,
    });

    const furniture4 = new FloorFurniture({
      roomX: 1,
      roomY: 7,
      roomZ: 0,
      animation: "0",
      direction: 0,
      id: 8434,
    });

    room.x = application.screen.width / 2 - room.roomWidth / 2;
    room.y = application.screen.height / 2 - room.roomHeight / 2;
    room.addRoomObject(furniture1);
    room.addRoomObject(furniture2);
    room.addRoomObject(furniture3);
    room.addRoomObject(furniture4);
    application.stage.addChild(room);
  });
}

export function DestroyFurniture() {
  return createShroom(({ application, shroom }) => {
    const container = new PIXI.Container();
    application.stage.addChild(container);

    const room = Room.create(shroom, {
      tilemap: `
       xxxxxxxxxxx
       x0000000000
       x0000000000
       x0000000000
       x0000000000
       x0000000000
       x0000000000
       x0000000000
       x0000000000
      `,
    });

    const furniture = new FloorFurniture({
      roomX: 1,
      roomY: 1,
      roomZ: 0,
      animation: "0",
      direction: 4,
      type: "club_sofa",
    });

    setTimeout(() => {
      room.removeRoomObject(furniture);
    }, 5000);

    room.x = application.screen.width / 2 - room.roomWidth / 2;
    room.y = application.screen.height / 2 - room.roomHeight / 2;
    room.addRoomObject(furniture);
    application.stage.addChild(room);
  });
}

export function DestroyFurnitureWhileLoading() {
  return createShroom(({ application, shroom }) => {
    const container = new PIXI.Container();
    application.stage.addChild(container);

    const furnitureLoader = shroom.dependencies
      .furnitureLoader as FurnitureLoader;

    furnitureLoader.delay = 5000;

    const room = Room.create(shroom, {
      tilemap: `
       xxxxxxxxxxx
       x0000000000
       x0000000000
       x0000000000
       x0000000000
       x0000000000
       x0000000000
       x0000000000
       x0000000000
      `,
    });

    const furniture = new FloorFurniture({
      roomX: 1,
      roomY: 1,
      roomZ: 0,
      animation: "0",
      direction: 4,
      type: "club_sofa",
    });

    setTimeout(() => {
      room.removeRoomObject(furniture);
    }, 2500);

    room.x = application.screen.width / 2 - room.roomWidth / 2;
    room.y = application.screen.height / 2 - room.roomHeight / 2;
    room.addRoomObject(furniture);
    application.stage.addChild(room);
  });
}

export function WallWindowDestroy() {
  return createShroom(({ application, shroom }) => {
    const container = new PIXI.Container();
    application.stage.addChild(container);

    const room = Room.create(shroom, {
      tilemap: `
       xxxxxxxxxxx
       x0000000000
       x0000000000
       x0000000000
       x0000000000
       x0000000000
       x0000000000
       x0000000000
       x0000000000
      `,
    });

    const furniture = new WallFurniture({
      roomX: 1,
      roomY: 1,
      offsetX: 0,
      offsetY: 0,
      animation: "0",
      direction: 4,
      type: "window_skyscraper",
    });

    setTimeout(() => {
      room.removeRoomObject(furniture);
    }, 4000);

    room.x = application.screen.width / 2 - room.roomWidth / 2;
    room.y = application.screen.height / 2 - room.roomHeight / 2;
    room.addRoomObject(furniture);
    application.stage.addChild(room);
  });
}

export function WallWindowDestroyWhileLoading() {
  return createShroom(({ application, shroom }) => {
    const container = new PIXI.Container();
    application.stage.addChild(container);

    const furnitureLoader = shroom.dependencies
      .furnitureLoader as FurnitureLoader;

    furnitureLoader.delay = 5000;

    const room = Room.create(shroom, {
      tilemap: `
       xxxxxxxxxxx
       x0000000000
       x0000000000
       x0000000000
       x0000000000
       x0000000000
       x0000000000
       x0000000000
       x0000000000
      `,
    });

    const furniture = new WallFurniture({
      roomX: 1,
      roomY: 1,
      offsetX: 0,
      offsetY: 0,
      animation: "0",
      direction: 4,
      type: "window_skyscraper",
    });

    setTimeout(() => {
      room.removeRoomObject(furniture);
    }, 2500);

    room.x = application.screen.width / 2 - room.roomWidth / 2;
    room.y = application.screen.height / 2 - room.roomHeight / 2;
    room.addRoomObject(furniture);
    application.stage.addChild(room);
  });
}

export function FurnitureColoring() {
  return createShroom(({ application, shroom }) => {
    const room = Room.create(shroom, {
      tilemap: `
       xxxxxxxxxxx
       x0000000000
       x0000000000
       x0000000000
       x0000000000
       x0000000000
       x0000000000
       x0000000000
       x0000000000
      `,
    });

    const furniture1 = new FloorFurniture({
      roomX: 1,
      roomY: 1,
      roomZ: 0,
      animation: "0",
      direction: 2,
      type: "bed_budget",
    });

    const furniture2 = new FloorFurniture({
      roomX: 1,
      roomY: 3,
      roomZ: 0,
      animation: "0",
      direction: 2,
      type: "rare_elephant_statue",
    });

    const furniture3 = new FloorFurniture({
      roomX: 1,
      roomY: 4,
      roomZ: 0,
      animation: "0",
      direction: 2,
      id: 290,
    });

    room.x = application.screen.width / 2 - room.roomWidth / 2;
    room.y = application.screen.height / 2 - room.roomHeight / 2;
    room.addRoomObject(furniture1);
    room.addRoomObject(furniture2);
    room.addRoomObject(furniture3);
    application.stage.addChild(room);
  });
}

export function WallFurniturePosition() {
  return createShroom(({ application, shroom }) => {
    const room = Room.create(shroom, {
      tilemap: `
      xxxxxxxxxxxx
      xxxxxxxxxxxx
      xxxxxxxxxxxx
      xxxxxxxxxxxx
      xxxxxxxxxxxx
      xxxxx000000x
      xxxxx000000x
      xxxx0000000x
      xxxxx000000x
      xxxxx000000x
      xxxxx000000x
      xxxxxxxxxxxx
      xxxxxxxxxxxx
      xxxxxxxxxxxx
      xxxxxxxxxxxx
      xxxxxxxxxxxx
      `,
    });

    const furniture1 = new WallFurniture({
      roomX: 4,
      roomY: 5,
      offsetX: 6,
      offsetY: 51,
      animation: "0",
      direction: 2,
      type: "flag_peru",
    });

    room.onActiveWallChange.subscribe((value) => {
      if (value == null) return;

      furniture1.roomX = value.roomX;
      furniture1.roomY = value.roomY;
      furniture1.offsetX = value.offsetX;
      furniture1.offsetY = value.offsetY;
      furniture1.direction = value.wall === "l" ? 2 : 4;

      console.log(value.offsetX, value.offsetY);
    });

    const furniture2 = new WallFurniture({
      roomX: 5,
      roomY: 4,
      offsetX: 9,
      offsetY: 51,
      animation: "0",
      direction: 4,
      type: "flag_peru",
    });

    const furniture3 = new WallFurniture({
      roomX: 4,
      roomY: 10,
      offsetX: 9,
      offsetY: 14,
      animation: "0",
      direction: 2,
      type: "flag_peru",
    });

    room.x = application.screen.width / 2 - room.roomWidth / 2;
    room.y = application.screen.height / 2 - room.roomHeight / 2;
    room.addRoomObject(furniture1);
    room.addRoomObject(furniture2);
    room.addRoomObject(furniture3);
    application.stage.addChild(room);
  });
}

export function FurnitureFlip() {
  return createShroom(({ application, shroom }) => {
    const room = Room.create(shroom, {
      tilemap: `
       xxxxxxxxxxx
       x0000000000
       x0000000000
       x0000000000
       x0000000000
       x0000000000
       x0000000000
       x0000000000
       x0000000000
      `,
    });

    const furniture1 = new FloorFurniture({
      roomX: 1,
      roomY: 1,
      roomZ: 0,
      animation: "0",
      direction: 0,
      type: "rare_fan*1",
    });

    const furniture2 = new FloorFurniture({
      roomX: 3,
      roomY: 1,
      roomZ: 0,
      animation: "0",
      direction: 6,
      type: "rare_fan*2",
    });

    room.x = application.screen.width / 2 - room.roomWidth / 2;
    room.y = application.screen.height / 2 - room.roomHeight / 2;
    room.addRoomObject(furniture1);
    room.addRoomObject(furniture2);
    application.stage.addChild(room);
  });
}

export function LayingAvatarsBehindBed() {
  return createShroom(({ application, shroom }) => {
    const room = Room.create(shroom, {
      tilemap: `
       xxxxxxxxxxx
       x0000000000
       x0000000000
       x0000000000
       x0000000000
       x0000000000
       x0000000000
       x0000000000
       x0000000000
      `,
    });

    const furniture1 = new FloorFurniture({
      roomX: 1,
      roomY: 1,
      roomZ: 0,
      animation: "0",
      direction: 2,
      type: "bed_budget",
    });

    const avatar = new Avatar({
      roomX: 1,
      roomY: 1,
      direction: 2,
      look: "hr-3163-39.hd-180-2.lg-3202-1322-1329.ch-215-1331",
      roomZ: 0,
    });

    avatar.addAction(AvatarAction.Lay);

    setTimeout(() => {
      avatar.walk(1, 2, 0);
    }, 2500);

    room.x = application.screen.width / 2 - room.roomWidth / 2;
    room.y = application.screen.height / 2 - room.roomHeight / 2;
    room.addRoomObject(furniture1);
    room.addRoomObject(avatar);
    application.stage.addChild(room);
  });
}

export function LoadTest() {
  return createShroom(({ application, shroom }) => {
    const room = Room.create(shroom, {
      tilemap: `
       xxxxxxxxxxx
       x0000000000
       x0000000000
       x0000000000
       x0000000000
       x0000000000
       x0000000000
       x0000000000
       x0000000000
      `,
    });

    fetch(`./furni.json`)
      .then((response) => response.json())
      .then((furnitures: any[]) => {
        furnitures.forEach((furni) => {
          const obj = new FloorFurniture({
            roomX: furni.x,
            roomY: furni.y,
            roomZ: furni.z,
            type: furni.item,
            direction: furni.rot,
            animation: furni.extra_data,
          });

          obj.extradata.then(({ visualization }) => {
            switch (visualization) {
              case "furniture_animated":
                obj.visualization = new AnimatedFurnitureVisualization();
                break;
              case "furniture_static":
                obj.visualization = new BasicFurnitureVisualization();
                break;
            }
          });

          room.addRoomObject(obj);
        });
      });

    const furniture1 = new FloorFurniture({
      roomX: 1,
      roomY: 1,
      roomZ: 0,
      animation: "0",
      direction: 2,
      type: "bed_budget",
    });

    const avatar = new Avatar({
      roomX: 1,
      roomY: 1,
      direction: 2,
      look: "hr-3163-39.hd-180-2.lg-3202-1322-1329.ch-215-1331",
      roomZ: 0,
    });

    avatar.addAction(AvatarAction.Lay);

    setTimeout(() => {
      avatar.walk(1, 2, 0);
    }, 2500);

    room.x = application.screen.width / 2 - room.roomWidth / 2;
    room.y = application.screen.height / 2 - room.roomHeight / 2;
    room.addRoomObject(furniture1);
    room.addRoomObject(avatar);
    application.stage.addChild(room);
  });
}
