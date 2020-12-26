import { AvatarData } from "./AvatarData";
import {
  AvatarAnimationFrame,
  IAvatarAnimationData,
} from "./interfaces/IAvatarAnimationData";
import { animationXml } from "./static/animation.xml";

export class AvatarAnimationData
  extends AvatarData
  implements IAvatarAnimationData {
  private _animationFrames = new Map<string, AvatarAnimationFrame[]>();
  private _aniamtionFramesCount = new Map<string, number>();

  constructor(xml: string) {
    super(xml);
  }

  getAnimationFrames(id: string, type: string) {
    const key = `${id}_${type};`;
    const current = this._animationFrames.get(key);

    if (current != null) {
      return current;
    }

    const frames = this.querySelectorAll(
      `action[id="${id}"] part[set-type="${type}"] frame`
    );

    const result = frames.map(
      (element): AvatarAnimationFrame => {
        const number = Number(element.getAttribute("number"));
        if (isNaN(number)) throw new Error("number was NaN");

        const repeatsString = element.getAttribute("repeats");

        let repeats = 2;

        if (repeatsString != null) {
          repeats = Number(repeatsString);
        }

        const assetpartdefinition = element.getAttribute("assetpartdefinition");
        if (assetpartdefinition == null)
          throw new Error("assetpartdefinition was null");

        return {
          number,
          assetpartdefinition,
          repeats,
        };
      }
    );

    this._animationFrames.set(key, result);
    return result;
  }

  getAnimationFramesCount(id: string) {
    const current = this._aniamtionFramesCount.get(id);

    if (current != null) return current;

    const partFrameCount = this.querySelectorAll(
      `action[id="${id}"] part:first-child frame`
    ).length;
    const offsetsFrameCount = this.querySelectorAll(
      `action[id="${id}"] offsets frame`
    ).length;

    const result = Math.max(partFrameCount, offsetsFrameCount);

    this._aniamtionFramesCount.set(id, result);

    return result;
  }

  getAnimationOffset(
    id: string,
    geometryId: string,
    frame: number,
    direction: number
  ) {
    const bodypart = this.querySelector(
      `action[id="${id}"] offsets frame[id="${frame}"] directions direction[id="${direction}"] bodypart[id="${geometryId}"]`
    );

    if (bodypart == null) return { x: 0, y: 0 };

    const dx = Number(bodypart.getAttribute("dx"));
    const dy = Number(bodypart.getAttribute("dy"));

    if (isNaN(dx) || isNaN(dy)) {
      return { x: 0, y: 0 };
    }

    return {
      x: dx,
      y: dy,
    };
  }

  static async fromUrl(url: string) {
    const response = await fetch(url);
    const text = await response.text();

    return new AvatarAnimationData(text);
  }

  static default() {
    return new AvatarAnimationData(atob(animationXml));
  }
}
