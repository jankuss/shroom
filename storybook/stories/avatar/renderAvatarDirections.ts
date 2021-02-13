import { Room, Avatar } from "@jankuss/shroom";
import { createShroom } from "../common/createShroom";

const directions = [0, 1, 2, 3, 4, 5, 6, 7];

export function renderAvatarDirections(
  look: string,
  dirs = directions,
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
      for (let x = 0; x < dirs.length; x++) {
        const direction = dirs[x];

        const avatar = new Avatar({
          look: look,
          direction: direction,
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
