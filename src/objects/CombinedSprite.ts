import * as PIXI from "pixi.js";

export class CombinedSprite extends PIXI.Sprite {
  private _sprites: PIXI.Sprite[] = [];
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

  private _updateTexture() {
    const texture = PIXI.RenderTexture.create({
      width: this._roomWidth,
      height: this._roomHeight + this._wallHeight,
    });

    const container = new PIXI.Container();
    this._sprites.forEach((sprite) => {
      const filter = new PIXI.filters.ColorMatrixFilter();
      filter.negative(false);
      sprite.filters = [filter];
      container.addChild(sprite);
    });
    container.y = this._wallHeight;

    this.y = -this._wallHeight;

    this._renderer.render(container, texture);

    this.texture = texture;
  }

  addSprite(element: PIXI.Sprite) {
    this._sprites.push(element);
    this._updateTexture();
  }
}
