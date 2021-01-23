import * as PIXI from "pixi.js";
import { Avatar, Room, FloorFurniture, RoomCamera } from "@jankuss/shroom";
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
      id: 160,
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
      id: 160,
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

export function Issue38() {
  return createShroom(({ application, shroom }) => {
    const room = Room.create(shroom, {
      tilemap: `
            xxxxxxxxxxxx
            xxxxx000xxxx
            xxxxx000xxxx
            x00000000000
            x00000000000
            x00000000000
            xxxxx000xxxx
            xxxxx000xxxx
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

export function IssueWithAvatarEventsNotHandled() {
  return createShroom(({ application, shroom }) => {
    const room = Room.create(shroom, {
      tilemap: `
            xxxxxxxxxxxx
            xxxxx000xxxx
            xxxxx000xxxx
            x00000000000
            x00000000000
            x00000000000
            xxxxx000xxxx
            xxxxx000xxxx
            xxxxxxxxxxxx
            `,
    });

    const avatar = new Avatar({
      look: "hd-180-1.hr-100-61.ch-210-66.lg-280-110.sh-305-62",
      direction: 2,
      roomX: 5,
      roomY: 6,
      roomZ: 0,
    });

    const furniture = new FloorFurniture({
      type: "edicehc",
      direction: 0,
      roomX: 4,
      roomY: 5,
      roomZ: 0,
    });

    avatar.onClick = (event) => {
      event.stopPropagation();

      action("Avatar Clicked")(event);
    };

    avatar.onDoubleClick = (event) => {
      event.stopPropagation();

      action("Avatar Double Clicked")(event);
    };

    furniture.onClick = (event) => {
      event.stopPropagation();

      furniture.animation = "-1";

      setTimeout(() => {
        furniture.animation = undefined;
      }, 3500);

      action("Furniture Clicked")(event);
    };

    avatar.onPointerDown = action("Avatar Pointer Down");
    avatar.onPointerUp = action("Avatar Pointer Up");

    furniture.onPointerDown = action("Furniture Pointer Down");
    furniture.onPointerUp = action("Furniture Pointer Up");

    room.onTileClick = action("Position");

    room.addRoomObject(furniture);
    room.addRoomObject(avatar);

    application.stage.addChild(room);
  });
}

export function IssueWithItemNotRenderingProperly() {
  return createShroom(({ application, shroom }) => {
    const room = Room.create(shroom, {
      tilemap: `
            xxxxx
            x0000
            x0000
            x0000
            x0000
            `,
    });

    const furniture = new FloorFurniture({
      type: "hc21_2",
      direction: 0,
      roomX: 1,
      roomY: 1,
      roomZ: 0,
    });

    room.onTileClick = action("Position");

    room.addRoomObject(furniture);

    application.stage.addChild(room);
  });
}

export function Issue56() {
  return createShroom(({ application, shroom, container: storyContainer }) => {
    const room = Room.create(shroom, {
      tilemap: `
            xxxxxxxxxxxx
            xxxxx000xxxx
            xxxxx000xxxx
            x00000000000
            x00000000000
            x00000000000
            xxxxx000xxxx
            xxxxx000xxxx
            xxxxxxxxxxxx
            `,
    });

    const container = RoomCamera.forScreen(room);
    application.stage.addChild(container);

    const window = new PIXI.Graphics();

    window.beginFill(0xffffff);
    window.drawRect(0, 0, 200, 400);
    window.endFill();
    window.interactive = true;

    application.stage.addChild(window);

    const child = document.createElement("div");
    child.style.width = "200px";
    child.style.height = "64px";
    child.style.backgroundColor = "#ffffff";
    child.style.position = "absolute";
    child.style.left = "200px";
    child.style.top = "50px";

    storyContainer.appendChild(child);
  });
}
