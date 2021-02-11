import { Room, Avatar } from "@jankuss/shroom";
import { createShroom } from "../common/createShroom";

export function renderAvatarDirections(
  look: string,
  callback: (avatar: Avatar) => void
) {
  return createShroom(({ application, shroom }) => {
    const room = Room.create(shroom, {
      tilemap: `
                       xxxxxxxxxxxxxxxx
                       x000000000000000
                       x000000000000000
                       x000000000000000
                      `,
    });

    const avatars: Avatar[] = [];

    for (let y = 1; y <= 1; y++) {
      for (let x = 0; x < 8; x++) {
        const avatar = new Avatar({
          look: look,
          direction: x,
          roomX: x * 2 + 1,
          roomY: y * 2 - 1,
          roomZ: 0,
        });

        callback(avatar);

        room.addRoomObject(avatar);
        avatars.push(avatar);
      }
    }

    application.stage.addChild(room);
  });
}
