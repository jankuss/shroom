import { Room } from "@jankuss/shroom";
import { TestRenderer } from "../../TestRenderer";

export const renderHiddenWalls: TestRenderer = ({ shroom, application }) => {
  const room = Room.create(shroom, {
    tilemap: `
        xxxxxxxxxxxx
        xxxxxxxxxxxx
        xxxxxxxxxxxx
        xxxxxxxxxxxx
        xxxxxxxxxxxx
        xxxxx000000x
        xxxxx000000x
        xxxx0000000x
        xxxxx000000x
        xxxxx000000x
        xxxxx000000x
        xxxxxxxxxxxx
        xxxxxxxxxxxx
        xxxxxxxxxxxx
        xxxxxxxxxxxx
        xxxxxxxxxxxx
        `,
  });

  room.hideWalls = true;

  application.stage.addChild(room);
};
