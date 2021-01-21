import { notNullOrUndefined } from "../../../../util/notNullOrUndefined";
import { AvatarData } from "./AvatarData";
import { FigureDataPart, IFigureData } from "./interfaces/IFigureData";

const _getColorKey = (paletteId: string, colorId: string) => {
  return `${paletteId}_${colorId}`;
};

const _getPartsKey = (setType: string, id: string) => {
  return `${setType}_${id}`;
};

export class FigureData extends AvatarData implements IFigureData {
  private _parts: Map<string, FigureDataPart[]> = new Map();
  private _paletteIdForSetType = new Map<string, string>();
  private _colors = new Map<string, string>();

  constructor(xml: string) {
    super(xml);

    this._cacheData();
  }

  static async fromUrl(url: string) {
    const response = await fetch(url);
    const text = await response.text();

    return new FigureData(text);
  }

  getColor(setType: string, colorId: string): string | undefined {
    const paletteId = this._paletteIdForSetType.get(setType);
    if (paletteId == null) return;

    return this._colors.get(_getColorKey(paletteId, colorId));
  }

  getParts(setType: string, id: string): FigureDataPart[] | undefined {
    return this._parts.get(_getPartsKey(setType, id));
  }

  getHiddenLayers(setType: string, id: string): string[] {
    const hiddenLayers = this.querySelectorAll(
      `sets settype[type="${setType}"] set[id="${id}"] hiddenlayers layer`
    )
      .map((element) => element.getAttribute("parttype"))
      .filter(notNullOrUndefined);

    return hiddenLayers;
  }

  private _cacheData() {
    const setTypes = this.querySelectorAll("sets settype");
    const palettes = this.querySelectorAll("colors palette");

    palettes.forEach((palette) => {
      const paletteId = palette.getAttribute("id");
      if (paletteId == null) return;

      const colors = Array.from(palette.querySelectorAll("color"));
      colors.forEach((color) => {
        const colorId = color.getAttribute("id");

        if (colorId != null) {
          this._colors.set(_getColorKey(paletteId, colorId), color.innerHTML);
        }
      });
    });

    setTypes.forEach((element) => {
      const setType = element.getAttribute("type");
      const paletteId = element.getAttribute("paletteid");

      const sets = this.querySelectorAll("set");

      if (setType == null) return;

      if (paletteId != null) {
        this._paletteIdForSetType.set(setType, paletteId);
      }

      sets.forEach((set) => {
        const setId = set.getAttribute("id");
        if (setId == null) return;

        const parts = Array.from(set.querySelectorAll("part"));
        const partArr: FigureDataPart[] = [];

        parts
          .map((part) => {
            const id = part.getAttribute("id");
            const type = part.getAttribute("type");
            const colorable = part.getAttribute("colorable");
            let index = Number(part.getAttribute("index"));

            if (isNaN(index)) {
              index = 0;
            }

            if (id == null) throw new Error("Invalid id");
            if (type == null) throw new Error("Invalid type");

            return {
              id,
              type,
              colorable: colorable === "1" ? true : false,
              index,
            };
          })
          .forEach((part) => {
            partArr.push(part);
          });

        this._parts.set(_getPartsKey(setType, setId), partArr);
      });
    });
  }
}
