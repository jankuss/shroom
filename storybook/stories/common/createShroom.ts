import * as PIXI from "pixi.js";
import { Shroom } from "@jankuss/shroom";

type CleanupFn = () => void;
type CallbackOptions = {
  application: PIXI.Application;
  shroom: Shroom;
  container: HTMLDivElement;
};

export function createShroom(
  cb: (options: CallbackOptions) => CleanupFn | void
): HTMLElement {
  const container = document.createElement("div");
  const element = document.createElement("canvas");
  container.appendChild(element);

  const application = new PIXI.Application({ view: element });
  const shroom = Shroom.create({
    resourcePath: "./resources",
    application: application,
    configuration: {
      placeholder: PIXI.Texture.from("./images/placeholder.png"),
    },
  });

  const cleanup = cb({ application, shroom, container });

  document.addEventListener("DOMNodeRemoved", (e) => {
    if (e.target === element) {
      application.destroy();
      if (cleanup != null && typeof cleanup === "function") {
        cleanup();
      }
    }
  });

  return container;
}
