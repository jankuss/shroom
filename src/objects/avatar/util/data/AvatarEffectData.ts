import { getNumberFromAttribute } from "../../../../util/getNumberFromAttribute";
import {
  AvatarEffectFrameBodypart,
  AvatarEffectSprite,
  IAvatarEffectData,
} from "./interfaces/IAvatarEffectData";

export class AvatarEffectData implements IAvatarEffectData {
  private _frameParts: Map<number, AvatarEffectFrameBodypart[]> = new Map();
  private _sprites: Map<string, AvatarEffectSprite> = new Map();

  constructor(string: string) {
    const document = new DOMParser().parseFromString(string, "text/xml");

    document.querySelectorAll("frame").forEach((frame, index) => {
      frame.querySelectorAll("bodypart").forEach((bodypart) => {
        const bodyPart = this._getFrameBodyPartFromElement(bodypart);
        const current = this._frameParts.get(index) ?? [];

        this._frameParts.set(index, [...current, bodyPart]);
      });
    });

    document.querySelectorAll("sprite").forEach((element) => {
      const sprite = this._getEffectSpriteFromElement(element);
      this._sprites.set(sprite.id, sprite);
    });
  }

  static async fromUrl(url: string) {
    const response = await fetch(url);
    const text = await response.text();

    return new AvatarEffectData(text);
  }

  getFrameBodyParts(frame: number): AvatarEffectFrameBodypart[] {
    return this._frameParts.get(frame) ?? [];
  }

  getFrameCount(): number {
    return this._frameParts.size;
  }

  getSprites(): AvatarEffectSprite[] {
    return Array.from(this._sprites.values());
  }

  getSpriteDirection(id: string, direction: number) {
    return undefined;
  }

  private _getEffectSpriteFromElement(element: Element): AvatarEffectSprite {
    const id = element.getAttribute("id");
    const ink = getNumberFromAttribute(element.getAttribute("ink"));
    const member = element.getAttribute("member") ?? undefined;
    const staticY = getNumberFromAttribute(element.getAttribute("staticY"));

    if (id == null) throw new Error("Invalid id");
    if (member == null) throw new Error("Invalid member");

    return {
      id,
      ink,
      member,
      staticY,
    };
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
      action,
      frame,
      id,
      dx,
      dy,
      dd,
    };
  }
}
