import { AvatarData } from "./AvatarData";
import {
  AvatarEffectFrame,
  IAvatarEffectData,
} from "./interfaces/IAvatarEffectData";

export class AvatarEffectData extends AvatarData implements IAvatarEffectData {
  private _frameParts: Map<number, AvatarEffectFrame[]> = new Map();
  private _frameCount: number | undefined;

  static async fromUrl(url: string) {
    const response = await fetch(url);
    const text = await response.text();

    return new AvatarEffectData(text);
  }

  getFrameParts(frame: number): AvatarEffectFrame[] {
    let current = this._frameParts.get(frame);
    if (current == null) {
      const frameElement = this.querySelectorAll(`frame`);

      if (frameElement[frame] == null) return [];

      const frameChildren = Array.from(
        frameElement[frame].querySelectorAll("bodypart")
      );

      const result = frameChildren.map((element) => {
        const action = element.getAttribute("action");
        const id = element.getAttribute("id");
        const frame = Number(element.getAttribute("frame"));
        const dx = Number(element.getAttribute("dx"));
        const dy = Number(element.getAttribute("dy"));
        const dd = Number(element.getAttribute("dd"));

        if (action == null) throw new Error("Invalid action");
        if (id == null) throw new Error("Invalid id");
        if (isNaN(frame)) throw new Error("Invalid frame");

        return {
          type: "bodypart" as const,
          action,
          frame,
          id,
          dx,
          dy,
          dd,
        };
      });

      this._frameParts.set(frame, result);
      current = result;
    }

    return current;
  }

  getFrameCount(): number {
    if (this._frameCount == null) {
      this._frameCount = this.querySelectorAll("frame").length;
    }

    return this._frameCount;
  }
}
