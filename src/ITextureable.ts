import * as PIXI from "pixi.js";

export interface ITexturable {
  texture: PIXI.Texture | undefined;
  color: string | undefined;
}
