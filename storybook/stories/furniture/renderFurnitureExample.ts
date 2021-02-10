import { Room, FloorFurniture } from "@jankuss/shroom";
import { createShroom } from "../common/createShroom";

export function renderFurnitureExample(
  type: string,
  {
    animations = ["0"],
    spacing = 2,
    directions,
  }: {
    directions: number[];
    animations?: string[];
    spacing: number;
  },
  cb: (furniture: FloorFurniture) => void = () => {
    /* Do nothing */
  }
) {
  return createShroom(({ shroom, application }) => {
    const room = Room.create(shroom, {
      tilemap: `
                           xxxxxxxxxxxxxxxx
                           x000000000000000
                           x000000000000000
                           x000000000000000
                           x000000000000000
                           x000000000000000
                          `,
    });

    let y = 0;

    for (const animation of animations) {
      let x = 0;

      for (const direction of directions) {
        const furniture = new FloorFurniture({
          roomX: 1 + x * spacing,
          roomY: 1 + y * spacing,
          roomZ: 0,
          direction,
          type,
          animation: animation,
        });

        room.addRoomObject(furniture);
        cb(furniture);
        x++;
      }

      y++;
    }

    application.stage.addChild(room);
  });
}
