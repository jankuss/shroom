import { AvatarData } from "./AvatarData";
import { IAvatarEffectMap } from "./IAvatarEffectMap";

export class AvatarEffectMap extends AvatarData implements IAvatarEffectMap {
  getEffectInfo(
    id: string
  ): { id: string; lib: string; type: string } | undefined {
    const element = this.querySelector(`effect[id="${id}"]`);

    if (element == null) return;
    const lib = element.getAttribute("lib");
    const type = element.getAttribute("type");

    if (lib == null) throw new Error("Invalid lib for effect");
    if (type == null) throw new Error("Invalid type for effect");

    return {
      id,
      lib,
      type,
    };
  }
}
