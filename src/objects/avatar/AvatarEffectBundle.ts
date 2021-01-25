import { IAssetBundle } from "../../assets/IAssetBundle";
import { HitTexture } from "../hitdetection/HitTexture";
import { AvatarEffectData } from "./util/data/AvatarEffectData";
import { IAvatarEffectBundle } from "./util/data/interfaces/IAvatarEffectBundle";
import { IAvatarEffectData } from "./util/data/interfaces/IAvatarEffectData";

export class AvatarEffectBundle implements IAvatarEffectBundle {
  private _data: Promise<IAvatarEffectData>;
  private _textures: Map<string, Promise<HitTexture>> = new Map();

  constructor(private _bundle: IAssetBundle) {
    this._data = _bundle
      .getString(`animation.bin`)
      .then((xml) => new AvatarEffectData(xml));
  }

  async getData(): Promise<IAvatarEffectData> {
    return this._data;
  }

  async getTexture(name: string): Promise<HitTexture> {
    const current = this._textures.get(name);
    if (current != null) return current;

    const blob = await this._bundle.getBlob(`${name}.png`);

    const texture = HitTexture.fromBlob(blob);
    this._textures.set(name, texture);

    return texture;
  }
}
