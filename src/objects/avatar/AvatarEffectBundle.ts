import { IAssetBundle } from "../../assets/IAssetBundle";
import { HitTexture } from "../hitdetection/HitTexture";
import { AvatarEffectData } from "./data/AvatarEffectData";
import { AvatarManifestData } from "./data/AvatarManifestData";
import { IAvatarEffectBundle } from "./data/interfaces/IAvatarEffectBundle";
import { IAvatarEffectData } from "./data/interfaces/IAvatarEffectData";
import { IAvatarManifestData } from "./data/interfaces/IAvatarManifestData";

export class AvatarEffectBundle implements IAvatarEffectBundle {
  private _data: Promise<IAvatarEffectData>;
  private _textures: Map<string, Promise<HitTexture>> = new Map();
  private _manifest: Promise<IAvatarManifestData>;

  constructor(private _bundle: IAssetBundle) {
    this._data = _bundle
      .getString(`animation.bin`)
      .then((xml) => new AvatarEffectData(xml));

    this._manifest = _bundle
      .getString(`manifest.bin`)
      .then((xml) => new AvatarManifestData(xml));
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

  async getManifest(): Promise<IAvatarManifestData> {
    return this._manifest;
  }
}
