import { Avatar, Room, FloorFurniture } from "@jankuss/shroom";
import { action } from "@storybook/addon-actions";
import { createShroom } from "./common/createShroom";

export default {
  title: "Issues",
};

export function Issue28() {
  return createShroom(({ application, shroom }) => {
    const room = Room.create(shroom, {
      tilemap: `
            xxxxxxxxxxxx
            xxxx00000000
            xxxx00000000
            xxxx00000000
            xxxx00000000
            xxx000000000
            xxxx00000000
            xxxx00000000
            xxxx00000000
            xxxx00000000
            xxxx00000000
            xxxx00000000
            xxxx00000000
            xxxx00000000
            xxxxxxxxxxxx
            xxxxxxxxxxxx
            `,
    });

    const avatar = new Avatar({
      look: "hd-180-1.hr-100-61.ch-210-66.lg-280-110.sh-305-62",
      direction: 2,
      roomX: 3,
      roomY: 5,
      roomZ: 0,
    });

    room.onTileClick = action("Position");

    room.addRoomObject(avatar);

    application.stage.addChild(room);
  });
}

export function Issue31() {
  return createShroom(({ application, shroom }) => {
    const room = Room.create(shroom, {
      tilemap: `
            xxxxxxxxxxxx
            xxxx00000000
            xxxx00000000
            xxxx00000000
            xxxx00000000
            xxx000000000
            xxxx00000000
            xxxx00000000
            xxxx00000000
            xxxx00000000
            xxxx00000000
            xxxx00000000
            xxxx00000000
            xxxx00000000
            xxxxxxxxxxxx
            xxxxxxxxxxxx
            `,
    });

    const avatar = new Avatar({
      look: "hd-180-1.hr-100-61.ch-210-66.lg-280-110.sh-305-62",
      direction: 2,
      roomX: 3,
      roomY: 5,
      roomZ: 0,
    });

    const furniture1 = new FloorFurniture({
      type: "plant_pineapple",
      direction: 0,
      roomX: 4,
      roomY: 1,
      roomZ: 0,
    });
    const furniture2 = new FloorFurniture({
      type: "plant_pineapple",
      direction: 0,
      roomX: 4,
      roomY: 1,
      roomZ: 0.5,
    });
    const furniture3 = new FloorFurniture({
      type: "plant_pineapple",
      direction: 0,
      roomX: 4,
      roomY: 1,
      roomZ: 1,
    });

    const furniture4 = new FloorFurniture({
      type: "plant_pineapple",
      direction: 0,
      roomX: 5,
      roomY: 1,
      roomZ: 0,
    });
    const furniture5 = new FloorFurniture({
      type: "plant_pineapple",
      direction: 0,
      roomX: 5,
      roomY: 1,
      roomZ: 0.5,
    });
    const furniture6 = new FloorFurniture({
      type: "plant_pineapple",
      direction: 0,
      roomX: 5,
      roomY: 1,
      roomZ: 1,
    });

    room.onTileClick = action("Position");

    room.addRoomObject(avatar);
    room.addRoomObject(furniture3);
    room.addRoomObject(furniture1);
    room.addRoomObject(furniture2);
    room.addRoomObject(furniture4);
    room.addRoomObject(furniture5);
    room.addRoomObject(furniture6);

    application.stage.addChild(room);
  });
}
