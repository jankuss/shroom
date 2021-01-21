import ByteBuffer from "bytebuffer";
import { IAssetBundle } from "./IAssetBundle";

export class ShroomAssetBundle implements IAssetBundle {
  public static readonly VERSION = 1;

  private _files: Map<string, ArrayBuffer | Buffer> = new Map();
  private _blobs: Map<string, Blob> = new Map();
  private _strings: Map<string, string> = new Map();

  constructor(
    files: { fileName: string; buffer: ArrayBuffer | Buffer }[] = []
  ) {
    files.forEach((file) => this._files.set(file.fileName, file.buffer));
  }

  static async fromUrl(url: string) {
    const response = await fetch(url);
    if (response.status >= 400)
      throw new Error(`Failed to load: ${url} - ${response.status}`);

    const buffer = await response.arrayBuffer();

    return ShroomAssetBundle.fromBuffer(buffer);
  }

  static fromBuffer(buffer: ArrayBuffer | Buffer) {
    const byteBuffer = ByteBuffer.wrap(buffer);

    const readFile = () => {
      const fileNameLength = byteBuffer.readUint16();
      const fileName = byteBuffer.readString(fileNameLength);
      const fileLength = byteBuffer.readUint32();
      const buffer = byteBuffer.readBytes(fileLength);

      return {
        fileName,
        buffer: buffer.toArrayBuffer(),
      };
    };

    const version = byteBuffer.readByte();
    const fileCount = byteBuffer.readUint16();
    const files: { fileName: string; buffer: ArrayBuffer | Buffer }[] = [];

    for (let i = 0; i < fileCount; i++) {
      const file = readFile();
      files.push(file);
    }

    return new ShroomAssetBundle(files);
  }

  addFile(fileName: string, buffer: ArrayBuffer | Buffer) {
    this._files.set(fileName, buffer);
  }

  toBuffer(): Buffer {
    const byteBuffer = new ByteBuffer();
    byteBuffer.writeByte(ShroomAssetBundle.VERSION);
    byteBuffer.writeUint16(this._files.size);

    this._files.forEach((buffer, key) => {
      byteBuffer.writeUint16(key.length);
      byteBuffer.writeString(key);
      byteBuffer.writeUint32(buffer.byteLength);
      byteBuffer.append(buffer);
    });

    return byteBuffer.flip().toBuffer();
  }

  async getBlob(name: string): Promise<Blob> {
    const current = this._blobs.get(name);
    if (current != null) return current;

    const buffer = this._files.get(name);
    if (buffer == null) throw new Error(`Couldn't find ${name}.`);

    const blob = new Blob([buffer]);
    this._blobs.set(name, blob);

    return blob;
  }

  async getString(name: string): Promise<string> {
    const current = this._strings.get(name);
    if (current != null) return current;

    const buffer = this._files.get(name);
    if (buffer == null) throw new Error(`Couldn't find ${name}.`);

    const encoder = new TextDecoder();
    const string = encoder.decode(buffer);
    this._strings.set(name, string);

    return string;
  }
}
