import { AvatarData } from "./AvatarData";
import {
  IAvatarManifestData,
  ManifestAlias,
  ManifestAsset,
} from "./interfaces/IAvatarManifestData";

export class AvatarManifestData
  extends AvatarData
  implements IAvatarManifestData {
  private _assets: ManifestAsset[] = [];
  private _assetbyName: Map<string, ManifestAsset> = new Map();

  private _aliases: ManifestAlias[] = [];

  constructor(xml: string) {
    super(xml);
    this._cacheData();
  }

  getAliases(): ManifestAlias[] {
    return this._aliases;
  }

  getAssets(): ManifestAsset[] {
    return this._assets;
  }

  getAssetByName(name: string): ManifestAsset | undefined {
    return this._assetbyName.get(name);
  }

  private _cacheData() {
    const assets = this.querySelectorAll(`assets asset`);
    const aliases = this.querySelectorAll(`aliases alias`);

    for (const asset of assets) {
      const offsetParam = asset.querySelector(`param[key="offset"]`);
      const value = offsetParam?.getAttribute("value");
      const name = asset.getAttribute("name");

      if (value != null && name != null) {
        const offsets = value.split(",");
        const x = Number(offsets[0]);
        const y = Number(offsets[1]);

        const asset: ManifestAsset = { name, x, y, flipH: false, flipV: false };
        this._assets.push(asset);
        this._assetbyName.set(name, asset);
      }
    }

    for (const alias of aliases) {
      const name = alias.getAttribute("name");
      const link = alias.getAttribute("link");
      const fliph = alias.getAttribute("fliph") === "1";
      const flipv = alias.getAttribute("flipv") === "1";

      if (name != null && link != null) {
        const alias: ManifestAlias = {
          name,
          link,
          fliph,
          flipv,
        };

        this._aliases.push(alias);
      }
    }
  }
}
