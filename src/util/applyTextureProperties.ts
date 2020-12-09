import * as PIXI from "pixi.js";

export function applyTextureProperties(texture: PIXI.Texture) {
  texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
}
