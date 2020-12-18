import { AvatarData } from "./AvatarData";
import { IAvatarAnimationData } from "./IAvatarAnimationData";

export class AvatarAnimationData
  extends AvatarData
  implements IAvatarAnimationData {
  constructor(xml: string) {
    super(xml);
  }

  getAnimationFrames(id: string, type: string) {
    const frames = this.querySelectorAll(
      `action[id="${id}"] part[set-type="${type}"] frame`
    );

    return frames.map((element) => {
      const number = Number(element.getAttribute("number"));
      if (isNaN(number)) throw new Error("number was NaN");

      const repeatsString = element.getAttribute("repeats");

      let repeats = 1;

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
    });
  }

  getAnimationFramesCount(id: string) {
    const partFrameCount = this.querySelectorAll(
      `action[id="${id}"] part:first-child frame`
    ).length;
    const offsetsFrameCount = this.querySelectorAll(
      `action[id="${id}"] offsets frame`
    ).length;

    return Math.max(partFrameCount, offsetsFrameCount);
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
}
