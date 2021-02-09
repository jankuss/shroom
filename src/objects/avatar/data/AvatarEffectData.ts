import { getNumberFromAttribute } from "../../../util/getNumberFromAttribute";
import {
  AvatarEffectDirection,
  AvatarEffectFrameBodypart,
  AvatarEffectFrameFXPart,
  AvatarEffectFXAddition,
  AvatarEffectSprite,
  AvatarEffectSpriteDirection,
  IAvatarEffectData,
} from "./interfaces/IAvatarEffectData";

export class AvatarEffectData implements IAvatarEffectData {
  private _frameBodyParts: Map<number, AvatarEffectFrameBodypart[]> = new Map();

  private _frameFxParts: Map<number, AvatarEffectFrameFXPart[]> = new Map();

  private _sprites: Map<string, AvatarEffectSprite> = new Map();
  private _additions: Map<string, AvatarEffectFXAddition> = new Map();

  private _spriteDirections: Map<
    string,
    AvatarEffectSpriteDirection
  > = new Map();
  private _direction: AvatarEffectDirection | undefined;
  private _frameCount: number;

  private _frameBodyPartsById: Map<
    string,
    AvatarEffectFrameBodypart
  > = new Map();
  private _frameBodyPartByBase: Map<
    string,
    AvatarEffectFrameBodypart
  > = new Map();

  private _frameFxPartsById: Map<string, AvatarEffectFrameFXPart> = new Map();

  constructor(string: string) {
    const document = new DOMParser().parseFromString(string, "text/xml");

    const frameElements = document.querySelectorAll("animation > frame");

    frameElements.forEach((frame, index) => {
      frame.querySelectorAll("bodypart").forEach((bodypart) => {
        const bodyPart = this._getFrameBodyPartFromElement(bodypart);
        const current = this._frameBodyParts.get(index) ?? [];

        this._frameBodyParts.set(index, [...current, bodyPart]);
        this._frameBodyPartsById.set(`${bodypart.id}_${index}`, bodyPart);

        if (bodyPart.base != null) {
          this._frameBodyPartByBase.set(`${bodyPart.base}_${index}`, bodyPart);
        }
      });

      frame.querySelectorAll("fx").forEach((element) => {
        const fxPart = this._getFXPartFromElement(element);
        const current = this._frameFxParts.get(index) ?? [];

        if (fxPart != null) {
          this._frameFxParts.set(index, [...current, fxPart]);
          this._frameFxPartsById.set(`${fxPart.id}_${index}`, fxPart);
        }
      });
    });

    document.querySelectorAll("sprite").forEach((element) => {
      const sprite = this._getEffectSpriteFromElement(element);
      this._sprites.set(sprite.id, sprite);

      element.querySelectorAll("direction").forEach((element) => {
        const direction = this._getDirectionSpriteFromElement(element);

        this._spriteDirections.set(`${sprite.id}_${direction.id}`, direction);
      });
    });

    document.querySelectorAll("add").forEach((element) => {
      const addition = this._getFXAddition(element);

      this._additions.set(addition.id, addition);
    });

    const directionElement = document.querySelector("animation > direction");
    if (directionElement != null) {
      this._direction = this._getDirectionFromElement(directionElement);
    }

    this._frameCount = frameElements.length;
  }

  static async fromUrl(url: string) {
    const response = await fetch(url);
    const text = await response.text();

    return new AvatarEffectData(text);
  }

  getFrameBodyPartByBase(
    bodyPartId: string,
    frame: number
  ): AvatarEffectFrameBodypart | undefined {
    return this._frameBodyPartByBase.get(`${bodyPartId}_${frame}`);
  }

  getFrameEffectPart(
    id: string,
    frame: number
  ): AvatarEffectFrameFXPart | undefined {
    return this._frameFxPartsById.get(`${id}_${frame}`);
  }

  getFrameBodyPart(
    bodyPartId: string,
    frame: number
  ): AvatarEffectFrameBodypart | undefined {
    return this._frameBodyPartsById.get(`${bodyPartId}_${frame}`);
  }

  getAddtions(): AvatarEffectFXAddition[] {
    return Array.from(this._additions.values());
  }

  getFrameEffectParts(frame: number): AvatarEffectFrameFXPart[] {
    return this._frameFxParts.get(frame) ?? [];
  }

  getDirection(): AvatarEffectDirection | undefined {
    return this._direction;
  }

  getFrameBodyParts(frame: number): AvatarEffectFrameBodypart[] {
    return this._frameBodyParts.get(frame) ?? [];
  }

  getFrameCount(): number {
    return this._frameCount;
  }

  getSprites(): AvatarEffectSprite[] {
    return Array.from(this._sprites.values());
  }

  getSpriteDirection(id: string, direction: number) {
    return this._spriteDirections.get(`${id}_${direction}`);
  }

  private _getFXAddition(element: Element): AvatarEffectFXAddition {
    const id = element.getAttribute("id") ?? undefined;
    const align = element.getAttribute("align") ?? undefined;
    const base = element.getAttribute("base") ?? undefined;

    if (id == null) throw new Error("Invalid id");

    return {
      id,
      align,
      base,
    };
  }

  private _getFXPartFromElement(
    element: Element
  ): AvatarEffectFrameFXPart | undefined {
    // action="Default" frame="0" dx="2" dy="0" dd="6"
    const action = element.getAttribute("action");
    const frame = getNumberFromAttribute(element.getAttribute("frame"));
    const dx = getNumberFromAttribute(element.getAttribute("dx"));
    const dy = getNumberFromAttribute(element.getAttribute("dy"));
    const dd = getNumberFromAttribute(element.getAttribute("dd"));
    const id = element.getAttribute("id");

    if (id == null) throw new Error("Invalid id");

    return {
      id,
      action: action ?? undefined,
      frame,
      dx,
      dy,
      dd,
    };
  }

  private _getDirectionFromElement(
    element: Element
  ): AvatarEffectDirection | undefined {
    const offset = getNumberFromAttribute(element.getAttribute("offset"));
    if (offset == null) return;

    return {
      offset,
    };
  }

  private _getDirectionSpriteFromElement(
    element: Element
  ): AvatarEffectSpriteDirection {
    const id = getNumberFromAttribute(element.getAttribute("id"));
    const dz = getNumberFromAttribute(element.getAttribute("dz"));
    const dx = getNumberFromAttribute(element.getAttribute("dx"));
    const dy = getNumberFromAttribute(element.getAttribute("dy"));

    if (id == null) throw new Error("Invalid id");

    return {
      id,
      dz,
      dx,
      dy,
    };
  }

  private _getEffectSpriteFromElement(element: Element): AvatarEffectSprite {
    const id = element.getAttribute("id");
    const ink = getNumberFromAttribute(element.getAttribute("ink"));
    const member = element.getAttribute("member") ?? undefined;
    const staticY = getNumberFromAttribute(element.getAttribute("staticY"));
    const directions = element.getAttribute("directions") === "1";

    if (id == null) throw new Error("Invalid id");

    return {
      id,
      ink,
      member,
      staticY,
      directions,
    };
  }

  private _getFrameBodyPartFromElement(element: Element) {
    const action = element.getAttribute("action") ?? undefined;
    const id = element.getAttribute("id");
    const frame = getNumberFromAttribute(element.getAttribute("frame"));
    const dx = getNumberFromAttribute(element.getAttribute("dx"));
    const dy = getNumberFromAttribute(element.getAttribute("dy"));
    const dd = getNumberFromAttribute(element.getAttribute("dd"));
    const base = element.getAttribute("base") ?? undefined;

    if (id == null) throw new Error("Invalid id");

    return {
      action,
      frame,
      id,
      dx,
      dy,
      dd,
      base,
    };
  }
}
