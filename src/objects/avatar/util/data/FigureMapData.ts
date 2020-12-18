import { notNullOrUndefined } from "../../../../util/notNullOrUndefined";
import { AvatarData } from "./AvatarData";
import { IFigureMapData } from "./IFigureMapData";

export class FigureMapData extends AvatarData implements IFigureMapData {
  constructor(xml: string) {
    super(xml);
  }

  getLibraryOfPart(id: string, type: string): string | undefined {
    const typeProcessed = type === "hrb" ? "hr" : type;
    const element = this.querySelector(
      `lib part[id="${id}"][type="${typeProcessed}"]`
    );

    return element?.parentElement?.getAttribute("id") ?? undefined;
  }

  getLibraries(): string[] {
    return this.querySelectorAll(`lib`)
      .map((element) => element.getAttribute("id"))
      .filter(notNullOrUndefined);
  }

  static async fromUrl(url: string) {
    const response = await fetch(url);
    const text = await response.text();

    return new FigureMapData(text);
  }
}
