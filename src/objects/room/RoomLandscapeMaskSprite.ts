import * as PIXI from "pixi.js";
import { Room } from "./Room";

const negativeFilter = new PIXI.filters.ColorMatrixFilter();
negativeFilter.negative(false);

/**
 * This class enables us to create a mask which
 * consists of multiple different sprites.
 *
 * This is important for correctly displaying
 * window furniture with landscapes.
 *
 * Windows usually provide a black mask image. This mask image is used
 * to only display the landscape in the area of the mask image.
 *
 * Since there can be multiple windows, and because of that multiple masks,
 * we need a sprite which is able to combine multiple sprites into a single
 * sprite.
 *
 * This Sprite renders its sub-sprites through `PIXI.RenderTexture`
 * into a single texture, and uses that as a texture for itself.
 */
export class RoomLandscapeMaskSprite extends PIXI.Sprite {
  private _sprites: Set<PIXI.Sprite> = new Set();
  private _roomWidth: number;
  private _roomHeight: number;
  private _wallHeight: number;
  private _renderer: PIXI.Renderer;

  constructor({
    width,
    height,
    wallHeight,
    renderer,
  }: {
    width: number;
    height: number;
    wallHeight: number;
    renderer: PIXI.Renderer;
  }) {
    super();
    this._roomWidth = width;
    this._roomHeight = height;
    this._wallHeight = wallHeight;
    this._renderer = renderer;
  }

  updateRoom(room: Room) {
    this._roomHeight = room.roomHeight;
    this._roomWidth = room.roomWidth;
    this._wallHeight = room.wallHeight;
  }

  private _updateTexture() {
    const texture = PIXI.RenderTexture.create({
      width: this._roomWidth,
      height: this._roomHeight + this._wallHeight,
    });

    const container = new PIXI.Container();
    this._sprites.forEach((sprite) => {
      // We apply a negative filter to the mask sprite, because the mask assets
      // of the furniture are usually completly black. `pixi.js` requires white
      // images to mask an image.
      sprite.filters = [negativeFilter];
      container.addChild(sprite);
    });

    container.y = this._wallHeight;
    this.y = -this._wallHeight;

    this._renderer.render(container, texture);

    this.texture = texture;
  }

  addSprite(element: PIXI.Sprite) {
    this._sprites.add(element);
    this._updateTexture();
  }

  removeSprite(element: PIXI.Sprite) {
    this._sprites.delete(element);
    this._updateTexture();
  }
}
