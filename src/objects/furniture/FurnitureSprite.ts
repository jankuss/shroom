import { HitSprite } from "../hitdetection/HitSprite";

export class FurnitureSprite extends HitSprite {
  private _baseX = 0;
  private _baseY = 0;
  private _baseZIndex = 0;

  private _offsetX = 0;
  private _offsetY = 0;
  private _offsetZIndex = 0;

  private _assetName: string | undefined;

  public get offsetX() {
    return this._offsetX;
  }

  public set offsetX(value) {
    this._offsetX = value;
    this._update();
  }

  public get offsetY() {
    return this._offsetY;
  }

  public set offsetY(value) {
    this._offsetY = value;
    this._update();
  }

  public get offsetZIndex() {
    return this._offsetZIndex;
  }

  public set offsetZIndex(value) {
    this._offsetZIndex = value;
    this._update();
  }

  public get baseX() {
    return this._baseX;
  }

  public set baseX(value) {
    this._baseX = value;
    this._update();
  }

  public get baseY() {
    return this._baseY;
  }

  public set baseY(value) {
    this._baseY = value;
    this._update();
  }

  public get baseZIndex() {
    return this._baseZIndex;
  }

  public set baseZIndex(value) {
    this._baseZIndex = value;
    this._update();
  }

  public get assetName() {
    return this._assetName;
  }

  public set assetName(value) {
    this._assetName = value;
  }

  private _update() {
    this.x = this.baseX + this.offsetX;
    this.y = this.baseY + this.offsetY;
    this.zIndex = this.baseZIndex + this.offsetZIndex;
  }
}
