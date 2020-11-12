import * as PIXI from "pixi.js";

export async function loadRoomTexture(url: string): Promise<PIXI.Texture> {
  const image = new Image();
  image.src = url;

  await new Promise((resolve) => {
    image.onload = () => {
      resolve();
    };
  });

  return PIXI.Texture.from(image);
}
