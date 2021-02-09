import { Room, Avatar } from "@jankuss/shroom";
import { createShroom } from "./common/createShroom";

export default {
  title: "Avatar / Effects",
};

function renderEffect(effect: string) {
  return createShroom(({ application, shroom }) => {
    const room = Room.create(shroom, {
      tilemap: `
                   xxxxxxxxxxxxxxxx
                   x000000000000000
                   x000000000000000
                   x000000000000000
                   x000000000000000
                   x000000000000000
                   x000000000000000
                   x000000000000000
                  `,
    });

    const avatars: Avatar[] = [];

    for (let y = 1; y <= 1; y++) {
      for (let x = 0; x < 8; x++) {
        const avatar2 = new Avatar({
          look:
            "hd-180-1.hr-828-61.ha-1012-110.he-1604-62.ea-1404-62.fa-1204-62.ch-255-66.lg-280-110.sh-305-62",
          direction: x,
          roomX: x * 2 + 1,
          roomY: y * 2 - 1,
          roomZ: 0,
        });

        avatar2.effect = `${effect}`;

        room.addRoomObject(avatar2);
        avatars.push(avatar2);
      }
    }

    application.stage.addChild(room);
  });
}

export function Dance1() {
  return renderEffect("dance.1");
}

export function Dance2() {
  return renderEffect("dance.2");
}

export function Dance3() {
  return renderEffect("dance.3");
}

export function Dance4() {
  return renderEffect("dance.4");
}

export function Spotlight() {
  return renderEffect("1");
}

export function Hoverboard() {
  return renderEffect("2");
}

export function UFO() {
  return renderEffect("3");
}
