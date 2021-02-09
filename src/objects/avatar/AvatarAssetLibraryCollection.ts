import { HitTexture } from "../hitdetection/HitTexture";
import { ManifestAsset } from "./data/interfaces/IAvatarManifestData";
import { IAvatarOffsetsData } from "./data/interfaces/IAvatarOffsetsData";
import { IManifestLibrary } from "./data/interfaces/IManifestLibrary";

const NO_ASSET = Symbol("NO_ASSET");

export class AvatarAssetLibraryCollection implements IAvatarOffsetsData {
  private _assets: Map<string, ManifestAsset> = new Map();
  private _libraries: Map<string, IManifestLibrary> = new Map();

  private _opened: Set<IManifestLibrary> = new Set();
  private _loadTextures: Map<
    string,
    Promise<HitTexture | typeof NO_ASSET>
  > = new Map();
  private _textures: Map<string, HitTexture | typeof NO_ASSET> = new Map();

  async open(bundle: IManifestLibrary) {
    if (this._opened.has(bundle)) return;

    this._opened.add(bundle);

    const manifest = await bundle.getManifest();
    await Promise.all(
      manifest.getAssets().map(async (asset) => {
        this._assets.set(asset.name, asset);
        this._libraries.set(asset.name, bundle);
      })
    );

    await Promise.all(
      manifest.getAliases().map((alias) => {
        const base = manifest.getAssetByName(alias.link);
        if (base != null) {
          this._assets.set(alias.name, {
            ...base,
            flipH: alias.fliph,
            flipV: alias.flipv,
          });
          this._libraries.set(alias.name, bundle);
        }
      })
    );
  }

  async loadTextures(ids: string[]) {
    return Promise.all(ids.map((id) => this._loadTexture(id)));
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

  getTexture(fileName: string) {
    const texture = this._textures.get(fileName);
    if (texture === NO_ASSET) return;

    return texture;
  }

  private _loadTexture(id: string) {
    const current = this._loadTextures.get(id);
    if (current != null) return current;

    const actualId = this._assets.get(id)?.name ?? id;

    const manifestLibrary = this._libraries.get(id);
    if (manifestLibrary == null)
      throw new Error(`Couldn't find library for ${id}`);

    const promise = manifestLibrary.getTexture(actualId).then((value) => {
      this._textures.set(id, value ?? NO_ASSET);
      return value ?? NO_ASSET;
    });
    this._loadTextures.set(id, promise);

    return promise;
  }
}
