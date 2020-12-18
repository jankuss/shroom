import { IAvatarOffsetsData } from "./IAvatarOffsetsData";

export class AvatarOffsetsData implements IAvatarOffsetsData {
  constructor(private json: any) {}

  getOffsets(
    fileName: string
  ): { offsetX: number; offsetY: number } | undefined {
    return this.json[fileName];
  }

  static async fromUrl(url: string) {
    const response = await fetch(url);
    const json = await response.json();

    return new AvatarOffsetsData(json);
  }
}
