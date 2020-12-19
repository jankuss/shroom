import { Room, Avatar } from "@jankuss/shroom";
import { createShroom } from "./common/createShroom";

export default {
  title: "Avatar",
};

export function Default() {
  return createShroom(({ application, shroom }) => {
    const room = Room.create(shroom, {
      tilemap: `
            000000000000000
            000000000000000
            000000000000000
            000000000000000
          `,
    });

    for (let i = 0; i < 8; i++) {
      const avatar = new Avatar({
        look: "hd-205-1.hr-155-61.ea-1406-107.ch-262-107.lg-280-110.sh-305-62",
        direction: i,
        roomX: i * 2,
        roomY: 0,
        roomZ: 0,
      });

      room.addRoomObject(avatar);
    }

    application.stage.addChild(room);
  });
}

export function Walking() {
  return createShroom(({ application, shroom }) => {
    const room = Room.create(shroom, {
      tilemap: `
           xxxxxxxx
           x0000000
           x0000000
           x0000000
           x0000000
          `,
    });

    const avatar = new Avatar({
      look: "hd-180-1.hr-100-61.ch-210-66.lg-280-110.sh-305-62",
      direction: 4,
      roomX: 1,
      roomY: 1,
      roomZ: 0,
    });

    setTimeout(() => {
      avatar.walk(1, 2, 0, { direction: 4 });
    }, 3000);

    setTimeout(() => {
      avatar.walk(2, 2, 0, { direction: 2 });
      avatar.walk(3, 2, 0, { direction: 2 });
    }, 5000);

    room.x = application.screen.width / 2 - room.roomWidth / 2;
    room.y = application.screen.height / 2 - room.roomHeight / 2;

    room.addRoomObject(avatar);

    application.stage.addChild(room);
  });
}

export function Drinking() {
  return createShroom(({ application, shroom }) => {
    const room = Room.create(shroom, {
      tilemap: `
            0000000
            0000000
            0000000
            0000000
          `,
    });

    const avatars: Avatar[] = [];

    for (let i = 0; i < 4; i++) {
      const avatar = new Avatar({
        look: "hd-180-1.hr-100-61.ch-210-66.lg-280-110.sh-305-62",
        direction: i * 2,
        roomX: i * 2,
        roomY: 0,
        roomZ: 0,
      });

      avatar.item = 40;

      room.addRoomObject(avatar);
      avatars.push(avatar);
    }

    for (let i = 0; i < 4; i++) {
      const avatar = new Avatar({
        look: "hd-180-1.hr-100-61.ch-210-66.lg-280-110.sh-305-62",
        direction: i * 2 + 1,
        roomX: i * 2,
        roomY: 3,
        roomZ: 0,
      });

      avatar.item = 40;

      room.addRoomObject(avatar);
      avatars.push(avatar);
    }

    room.x = application.screen.width / 2 - room.roomWidth / 2;
    room.y = application.screen.height / 2 - room.roomHeight / 2;

    application.stage.addChild(room);
  });
}
