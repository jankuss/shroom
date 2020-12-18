import { notNullOrUndefined } from "../../../../util/notNullOrUndefined";
import { AvatarData } from "./AvatarData";
import {
  AvatarGeometry,
  Bodypart,
  IAvatarGeometryData,
} from "./IAvatarGeometryData";

export class AvatarGeometryData
  extends AvatarData
  implements IAvatarGeometryData {
  getBodyPart(geometry: string, bodyPartId: string): Bodypart | undefined {
    const element = this.querySelector(
      `type[id="${geometry}"] bodypart[id="${bodyPartId}"]`
    );

    if (element == null) return;
    const id = element.getAttribute("id");

    if (id == null) return;

    const z = Number(element.getAttribute("z"));

    if (isNaN(z)) return;

    return {
      id,
      items: Array.from(element.querySelectorAll("item"))
        .map((item) => {
          const id = item.getAttribute("id");
          const z = Number(item.getAttribute("z"));

          if (id == null) return;
          if (isNaN(z)) return;

          return {
            id,
            z,
          };
        })
        .filter(notNullOrUndefined),
      z,
    };
  }

  getBodyParts(avaterSet: string): string[] {
    const bodyParts = this.querySelectorAll(
      `avatarset[id="${avaterSet}"] bodypart`
    );

    return bodyParts
      .map((element) => element.getAttribute("id"))
      .filter(notNullOrUndefined);
  }

  getGeometry(geometry: string): AvatarGeometry | undefined {
    const element = this.querySelector(
      `canvas[scale="h"] geometry[id="${geometry}"]`
    );

    const width = Number(element?.getAttribute("width"));
    const height = Number(element?.getAttribute("height"));
    const dx = Number(element?.getAttribute("dx"));
    const dy = Number(element?.getAttribute("dy"));

    return {
      width,
      height,
      dx,
      dy,
    };
  }

  static async fromUrl(url: string) {
    const response = await fetch(url);
    const text = await response.text();

    return new AvatarGeometryData(text);
  }
}
