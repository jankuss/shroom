import { reject } from "bluebird";
import * as PIXI from "pixi.js";
import { applyTextureProperties } from "../../util/applyTextureProperties";

export class HitTexture {
  private _texture: PIXI.Texture;
  private _image: HTMLImageElement;
  private _cachedHitmap: Uint32Array | undefined;

  public get texture() {
    return this._texture;
  }

  constructor(image: HTMLImageElement) {
    if (!image.complete) throw new Error("Image not loaded.");

    this._image = image;
    this._texture = PIXI.Texture.from(image);
    applyTextureProperties(this._texture);
  }

  private getHitMap() {
    if (this._cachedHitmap == null) {
      this._cachedHitmap = generateHitMap(this._image);
    }

    return this._cachedHitmap;
  }

  hits(
    x: number,
    y: number,
    transform: { x: number; y: number },
    options: { mirrorHorizonally?: boolean } = { mirrorHorizonally: false }
  ) {
    if (options.mirrorHorizonally) {
      x = -(x - transform.x);
    } else {
      x = x - transform.x;
    }
    y = y - transform.y;

    const baseTexture = this._texture.baseTexture;
    const hitmap = this.getHitMap();

    let dx = Math.round(x * baseTexture.resolution);
    let dy = Math.round(y * baseTexture.resolution);
    let ind = dx + dy * baseTexture.realWidth;
    let ind1 = ind % 32;
    let ind2 = (ind / 32) | 0;
    return (hitmap[ind2] & (1 << ind1)) !== 0;
  }

  static async fromUrl(imageUrl: string) {
    const image = new Image();
    image.src = imageUrl;

    await new Promise<{
      width: number;
      height: number;
    }>((resolve) => {
      image.onload = (value) => {
        resolve({ width: image.width, height: image.height });
      };

      image.onerror = (value) => reject(value);
    });

    return new HitTexture(image);
  }
}

function generateHitMap(image: HTMLImageElement) {
  const canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;
  const context = canvas.getContext("2d");

  if (context == null) throw new Error("Invalid context 2d");

  const threshold = 25;

  const w = canvas.width;
  const h = canvas.height;
  context.drawImage(image, 0, 0);

  let imageData = context.getImageData(0, 0, w, h);

  let hitmap = new Uint32Array(Math.ceil((w * h) / 32));
  for (let i = 0; i < w * h; i++) {
    let ind1 = i % 32;
    let ind2 = (i / 32) | 0;
    if (imageData.data[i * 4 + 3] >= threshold) {
      hitmap[ind2] = hitmap[ind2] | (1 << ind1);
    }
  }

  return hitmap;
}
