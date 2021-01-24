import { traverseDOMTree } from "../../../../util/traverseDOMTree";
import { AvatarData } from "./AvatarData";
import {
  AvatarEffectFrameBodypart,
  IAvatarEffectData,
} from "./interfaces/IAvatarEffectData";

export class AvatarEffectData implements IAvatarEffectData {
  private _frameParts: Map<number, AvatarEffectFrameBodypart[]> = new Map();

  constructor(string: string) {
    const document = new DOMParser().parseFromString(string, "text/xml");

    let frameIndex = 0;
    let currentFrameIndex: number | undefined;

    traverseDOMTree(document, {
      enter: (node) => {
        if (node instanceof Element && node.tagName.toLowerCase() === "frame") {
          currentFrameIndex = frameIndex++;
        }

        if (
          node instanceof Element &&
          node.tagName.toLowerCase() === "bodypart" &&
          currentFrameIndex != null
        ) {
          const current = this._frameParts.get(currentFrameIndex) ?? [];
          const bodyPart = this._getFrameBodyPartFromElement(node);

          this._frameParts.set(currentFrameIndex, [...current, bodyPart]);
        }
      },
      exit: () => {},
    });
  }

  static async fromUrl(url: string) {
    const response = await fetch(url);
    const text = await response.text();

    return new AvatarEffectData(text);
  }

  getFrameParts(frame: number): AvatarEffectFrameBodypart[] {
    return this._frameParts.get(frame) ?? [];
  }

  getFrameCount(): number {
    return this._frameParts.size;
  }

  private _getFrameBodyPartFromElement(element: Element) {
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
  }
}
