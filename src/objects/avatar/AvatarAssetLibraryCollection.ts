import { IAssetBundle } from "../../assets/IAssetBundle";
import { AvatarManifestData } from "./util/data/AvatarManifestData";
import { ManifestAsset } from "./util/data/interfaces/IAvatarManifestData";
import { IAvatarOffsetsData } from "./util/data/interfaces/IAvatarOffsetsData";

export class AvatarAssetLibraryCollection implements IAvatarOffsetsData {
  private _assets: Map<string, ManifestAsset> = new Map();
  private _opened: Set<IAssetBundle> = new Set();

  async open(bundle: IAssetBundle) {
    if (this._opened.has(bundle)) return;
    this._opened.add(bundle);

    bundle.getString(`manifest.bin`).then((manifestFile) => {
      const manifest = new AvatarManifestData(manifestFile);
      manifest.getAssets().forEach((asset) => {
        this._assets.set(asset.name, asset);
      });

      console.log("OPENED", this._assets.size);
    });
  }

  getOffsets(
    fileName: string
  ): { offsetX: number; offsetY: number } | undefined {
    const asset = this._assets.get(fileName);
    if (asset == null) return;

    return {
      offsetX: asset.x,
      offsetY: asset.y,
    };
  }
}
