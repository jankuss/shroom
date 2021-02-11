import { IAvatarOffsetsData } from "./interfaces/IAvatarOffsetsData";

export class AvatarOffsetsData implements IAvatarOffsetsData {
  constructor(private _json: any) {}

  static async fromUrl(url: string) {
    const response = await fetch(url);
    const json = await response.json();

    return new AvatarOffsetsData(json);
  }

  getOffsets(
    fileName: string
  ): { offsetX: number; offsetY: number } | undefined {
    return this._json[fileName];
  }
}
