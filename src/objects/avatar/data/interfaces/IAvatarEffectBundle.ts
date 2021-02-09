import { HitTexture } from "../../../hitdetection/HitTexture";
import { IAvatarEffectData } from "./IAvatarEffectData";
import { IAvatarManifestData } from "./IAvatarManifestData";
import { IManifestLibrary } from "./IManifestLibrary";

export interface IAvatarEffectBundle extends IManifestLibrary {
  getData(): Promise<IAvatarEffectData>;
  getTexture(name: string): Promise<HitTexture>;
  getManifest(): Promise<IAvatarManifestData>;
}
