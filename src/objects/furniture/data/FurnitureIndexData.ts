import { FurnitureIndexJson } from "./FurnitureIndexJson";

export class FurnitureIndexData {
  private _visualization: string | undefined;
  private _logic: string | undefined;

  public get visualization() {
    return this._visualization;
  }

  public get logic() {
    return this._logic;
  }

  constructor(xml: string) {
    const document = new DOMParser().parseFromString(xml, "text/xml");
    const object = document.querySelector("object");

    this._visualization = object?.getAttribute("visualization") ?? undefined;
    this._logic = object?.getAttribute("logic") ?? undefined;
  }

  static async fromUrl(url: string) {
    const response = await fetch(url);
    const text = await response.text();

    return new FurnitureIndexData(text);
  }

  toJson(): FurnitureIndexJson {
    return this.toObject();
  }

  toObject() {
    return { visualization: this.visualization, logic: this.logic };
  }
}
