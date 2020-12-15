import { Room, Avatar } from "@jankuss/shroom";
import { createShroom } from "./common/createShroom";

export default {
  title: "Avatar",
};

export function Walking() {
  return createShroom(({ application, shroom }) => {
    const room = Room.create(shroom, {
      tilemap: `
            0000000
            0000000
            0000000
            0000000
          `,
    });

    const avatar = new Avatar({
      look: "hd-180-1.hr-100-61.ch-210-66.lg-280-110.sh-305-62",
      direction: 4,
      roomX: 0,
      roomY: 0,
      roomZ: 0,
    });

    setTimeout(() => {
      avatar.walk(0, 1, 0, { direction: 4 });
    }, 3000);

    setTimeout(() => {
      avatar.walk(1, 1, 0, { direction: 2 });
      avatar.walk(2, 1, 0, { direction: 2 });
    }, 5000);

    room.x = application.screen.width / 2 - room.roomWidth / 2;
    room.y = application.screen.height / 2 - room.roomHeight / 2;

    room.addRoomObject(avatar);

    application.stage.addChild(room);
  });
}
