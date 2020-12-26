import * as PIXI from "pixi.js";
import { applyTextureProperties } from "./applyTextureProperties";

export async function loadRoomTexture(url: string): Promise<PIXI.Texture> {
  const image = new Image();

  image.crossOrigin = "anonymous";
  image.src = url;

  await new Promise<void>((resolve) => {
    image.onload = () => {
      resolve();
    };
  });

  const texture = PIXI.Texture.from(image);
  applyTextureProperties(texture);

  return texture;
}
