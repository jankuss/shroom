import { IAssetBundle } from "./IAssetBundle";

export class LegacyAssetBundle implements IAssetBundle {
  private _blobs: Map<string, Promise<Blob>> = new Map();
  private _strings: Map<string, Promise<string>> = new Map();

  constructor(private _folderUrl: string) {}

  async getBlob(name: string): Promise<Blob> {
    const current = this._blobs.get(name);
    if (current != null) return current;

    const imageUrl = `${this._folderUrl}/${name}`;

    const blob = fetch(imageUrl).then((response) => response.blob());
    this._blobs.set(name, blob);

    return blob;
  }

  async getString(name: string): Promise<string> {
    const current = this._strings.get(name);
    if (current != null) return current;

    const imageUrl = `${this._folderUrl}/${name}`;

    const string = fetch(imageUrl).then((response) => response.text());
    this._strings.set(name, string);

    return string;
  }
}
