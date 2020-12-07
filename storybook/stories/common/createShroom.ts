import * as PIXI from "pixi.js";
import { Shroom } from "@jankuss/shroom";

export function createShroom(
  cb: (options: { application: PIXI.Application; shroom: Shroom }) => void
) {
  const element = document.createElement("canvas");
  const application = new PIXI.Application({ view: element });
  const shroom = Shroom.create({
    resourcePath: "./resources",
    application: application,
  });

  cb({ application, shroom });

  return element;
}
