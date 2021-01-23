import { Room } from "@jankuss/shroom";
import { TestRenderer } from "../../../../TestRenderer";

export function renderModel(tilemap: string): TestRenderer {
  return ({ shroom, application }) => {
    const room = Room.create(shroom, {
      tilemap: tilemap,
    });

    application.stage.addChild(room);
  };
}
