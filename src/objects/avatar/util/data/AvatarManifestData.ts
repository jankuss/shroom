import { AvatarData } from "./AvatarData";
import {
  IAvatarManifestData,
  ManifestAsset,
} from "./interfaces/IAvatarManifestData";

export class AvatarManifestData
  extends AvatarData
  implements IAvatarManifestData {
  private _assets: ManifestAsset[] = [];

  constructor(xml: string) {
    super(xml);
    this._cacheData();
  }

  getAssets(): ManifestAsset[] {
    return this._assets;
  }

  private _cacheData() {
    const assets = this.querySelectorAll(`assets asset`);

    for (const asset of assets) {
      const offsetParam = asset.querySelector(`param[key="offset"]`);
      const value = offsetParam?.getAttribute("value");
      const name = asset.getAttribute("name");

      if (value != null && name != null) {
        const offsets = value.split(",");
        const x = Number(offsets[0]);
        const y = Number(offsets[1]);

        this._assets.push({ name, x, y });
      }
    }
  }
}
