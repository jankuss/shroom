import { IAssetBundle } from "../../../assets/IAssetBundle";
import { HitTexture } from "../../hitdetection/HitTexture";
import { AvatarManifestData } from "./AvatarManifestData";
import { IAvatarManifestData } from "./interfaces/IAvatarManifestData";
import { IManifestLibrary } from "./interfaces/IManifestLibrary";

export class ManifestLibrary implements IManifestLibrary {
  private _manifest: Promise<IAvatarManifestData>;
  private _map: Map<string, Promise<HitTexture | undefined>> = new Map();

  constructor(private _bundle: IAssetBundle) {
    this._manifest = _bundle.getString("manifest.bin").then((manifest) => {
      return new AvatarManifestData(manifest);
    });
  }

  async getManifest(): Promise<IAvatarManifestData> {
    return this._manifest;
  }

  async getTexture(name: string): Promise<HitTexture | undefined> {
    const current = this._map.get(name);
    if (current != null) return current;

    const value = this._bundle
      .getBlob(`${name}.png`)
      .then((blob) => HitTexture.fromBlob(blob))
      .catch(() => undefined);

    this._map.set(name, value);

    return value;
  }
}
