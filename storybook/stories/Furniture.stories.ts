import { FloorFurniture, Room } from "@jankuss/shroom";
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

      room.addRoomObject(furniture);
    }

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
