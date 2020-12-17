import { Avatar, Room } from "@jankuss/shroom";
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
