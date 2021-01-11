import { AvatarData } from "./AvatarData";
import { IFigureMapData } from "./interfaces/IFigureMapData";

function _getLibraryForPartKey(id: string, type: string) {
  return `${id}_${type}`;
}

export class FigureMapData extends AvatarData implements IFigureMapData {
  private _libraryForPartMap = new Map<string, string>();
  private _allLibraries: string[] = [];

  constructor(xml: string) {
    super(xml);
    this._cacheData();
  }

  static async fromUrl(url: string) {
    const response = await fetch(url);
    const text = await response.text();

    return new FigureMapData(text);
  }

  getLibraryOfPart(id: string, type: string): string | undefined {
    const typeProcessed = type === "hrb" ? "hr" : type;

    return this._libraryForPartMap.get(
      _getLibraryForPartKey(id, typeProcessed)
    );
  }

  getLibraries(): string[] {
    return this._allLibraries;
  }

  private _cacheData() {
    const allLibraries = this.querySelectorAll(`lib`);

    allLibraries.forEach((element) => {
      const libraryId = element.getAttribute("id");
      if (libraryId == null) return;

      this._allLibraries.push(libraryId);

      const parts = Array.from(element.querySelectorAll("part"));

      parts.forEach((part) => {
        const partId = part.getAttribute("id");
        const partType = part.getAttribute("type");

        if (partId == null) return;
        if (partType == null) return;

        this._libraryForPartMap.set(
          _getLibraryForPartKey(partId, partType),
          libraryId
        );
      });
    });
  }
}
