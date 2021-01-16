import JSZip from "jszip";

import { IAssetBundle } from "./IAssetBundle";

export class ZipAssetBundle implements IAssetBundle {
  private _blobs: Map<string, Promise<Blob>> = new Map();
  private _strings: Map<string, Promise<string>> = new Map();
  private _zip: Promise<JSZip>;

  constructor(zipUrl: string) {
    this._zip = fetch(zipUrl).then(async (response) => {
      return JSZip.loadAsync(await response.blob());
    });
  }

  async getBlob(name: string): Promise<Blob> {
    const current = this._blobs.get(name);
    if (current != null) return current;

    const zip = await this._zip;
    const file = zip.file(name);

    if (file == null) throw new Error(`Couldn't find file ${name}`);

    const blob = file.async("blob");
    this._blobs.set(name, blob);

    return blob;
  }

  async getString(name: string): Promise<string> {
    const current = this._strings.get(name);
    if (current != null) return current;

    const zip = await this._zip;
    const file = zip.file(name);

    if (file == null) throw new Error(`Couldn't find file ${name}`);

    const string = file.async("string");
    this._strings.set(name, string);

    return string;
  }
}
