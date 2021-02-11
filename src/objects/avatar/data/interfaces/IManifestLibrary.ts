import { HitTexture } from "../../../hitdetection/HitTexture";
import { IAvatarManifestData } from "./IAvatarManifestData";

export interface IManifestLibrary {
  getManifest(): Promise<IAvatarManifestData>;
  getTexture(name: string): Promise<HitTexture | undefined>;
}
