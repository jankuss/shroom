import {
  FloorFurniture,
  Room,
  RoomCamera,
  WallFurniture,
} from "@jankuss/shroom";
import { createShroom } from "./common/createShroom";
import { action } from "@storybook/addon-actions";

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
      furniture.validDirections.then(action(`Furniture ${i} valid directions`));

      room.addRoomObject(furniture);
    }

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
        roomX: 1 + i * 3,
        roomY: 1,
        roomZ: 0,
        type: `rare_dragonlamp*${i}`,
        direction,
        animation,
      });

      furniture.onClick = action(`Furniture ${i} clicked`);
      furniture.onDoubleClick = (value) => {
        if (furniture.animation === "0") {
          furniture.animation = "1";
        } else {
          furniture.animation = "0";
        }
      };

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
      roomZ: 0,
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

export function GldGate() {
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

    const floorFurniture = new FloorFurniture({
      type: "gld_gate",
      direction: 2,
      roomX: 1,
      roomY: 1,
      roomZ: 0,
      animation: "0",
    });

    const floorFurniture2 = new FloorFurniture({
      type: "gld_gate",
      direction: 2,
      roomX: 1,
      roomY: 3,
      roomZ: 0,
      animation: "1",
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

    floorFurniture3.onClick = () => {
      b = !b;

      if (b) {
        floorFurniture3.animation = "100";
      } else {
        floorFurniture3.animation = "101";
      }
    };

    const floorFurniture4 = new FloorFurniture({
      type: "gld_gate",
      direction: 2,
      roomX: 1,
      roomY: 7,
      roomZ: 0,
      animation: "101",
    });

    //room.addRoomObject(floorFurniture);
    //room.addRoomObject(floorFurniture2);
    room.addRoomObject(floorFurniture3);
    //room.addRoomObject(floorFurniture4);

    application.stage.addChild(room);
  });
}

export function BigRoom() {
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

    fetch("./furni.json")
      .then((response) => response.json())
      .then((value) => {
        value.forEach((value) => {
          room.addRoomObject(
            new FloorFurniture({
              direction: value.rot,
              roomX: value.x,
              roomY: value.y,
              roomZ: value.z,
              type: value.item,
              animation: value.extra_data,
            })
          );
        });
      });

    application.stage.addChild(RoomCamera.forScreen(room));
  });
}
