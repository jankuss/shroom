import { notNullOrUndefined } from "../../../../util/notNullOrUndefined";
import { AvatarData } from "./AvatarData";
import { FigureDataPart, IFigureData } from "./IFigureData";

export class FigureData extends AvatarData implements IFigureData {
  getColor(setType: string, colorId: string): string | undefined {
    const set = this.querySelector(`sets settype[type="${setType}"]`);

    if (set == null) return;
    const palette = set.getAttribute("paletteid");

    if (palette == null) return;

    const color = this.querySelector(
      `colors palette[id="${palette}"] color[id="${colorId}"]`
    );

    if (color == null) return;

    return color?.innerHTML;
  }

  getParts(setType: string, id: string): FigureDataPart[] | undefined {
    const parts = this.querySelectorAll(
      `sets settype[type="${setType}"] set[id="${id}"] part`
    );

    if (parts.length < 1) return;

    return parts.map((part) => {
      const id = part.getAttribute("id");
      const type = part.getAttribute("type");
      const colorable = part.getAttribute("colorable");

      if (id == null) throw new Error("Invalid id");
      if (type == null) throw new Error("Invalid type");

      return {
        id,
        type,
        colorable: colorable === "1" ? true : false,
      };
    });
  }

  getHiddenLayers(setType: string, id: string): string[] {
    const hiddenLayers = this.querySelectorAll(
      `sets settype[type="${setType}"] set[id="${id}"] hiddenlayers layer`
    )
      .map((element) => element.getAttribute("parttype"))
      .filter(notNullOrUndefined);

    return hiddenLayers;
  }

  static async fromUrl(url: string) {
    const response = await fetch(url);
    const text = await response.text();

    return new FigureData(text);
  }
}
