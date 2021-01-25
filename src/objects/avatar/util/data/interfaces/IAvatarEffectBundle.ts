import { HitTexture } from "../../../../hitdetection/HitTexture";
import { IAvatarEffectData } from "./IAvatarEffectData";

export interface IAvatarEffectBundle {
  getData(): Promise<IAvatarEffectData>;
  getTexture(name: string): Promise<HitTexture>;
}
