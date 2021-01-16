import {
  FurnitureId,
  FurnitureInfo,
  IFurnitureData,
} from "../../interfaces/IFurnitureData";
import { parseStringPromise } from "xml2js";
import { formatFurnitureData } from "../../util/furnitureDataTransformers";
import { IFurniture } from "./IFurniture";

type FurnitureMap = {
  [key: string]: FurnitureInfo | undefined;
};

type IdToTypeMap = {
  [key: string]: string | undefined;
};

export class FurnitureData implements IFurnitureData {
  private _data: Promise<{
    typeToInfo: FurnitureMap;
    floorIdToType: IdToTypeMap;
    wallIdToType: IdToTypeMap;
  }>;

  constructor(private _getFurniData: () => Promise<string>) {
    this._data = this._prepareData();
  }

  static create(resourcePath = "") {
    return new FurnitureData(async () =>
      fetch(`${resourcePath}/furnidata.xml`).then((response) => response.text())
    );
  }

  async getRevisionForType(type: string): Promise<number | undefined> {
    const info = await this.getInfo(type);

    return info?.revision;
  }

  async getInfo(type: string): Promise<FurnitureInfo | undefined> {
    const data = await this._data;
    return data.typeToInfo[type];
  }

  async getTypeById(
    id: FurnitureId,
    placementType: "wall" | "floor"
  ): Promise<string | undefined> {
    const data = await this._data;
    const type =
      placementType != "floor" ? data.floorIdToType[id] : data.wallIdToType[id];

    if (type == null) return;

    return type;
  }

  async getInfoForFurniture(furniture: IFurniture) {
    if (furniture.id != null) {
      const type = await this.getTypeById(
        furniture.id,
        furniture.placementType
      );

      if (type != null) {
        return this.getInfo(type);
      }
    }

    if (furniture.type != null) {
      return this.getInfo(furniture.type);
    }
  }

  async getInfos(): Promise<[string, FurnitureInfo][]> {
    const data = await this._data;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return Object.entries(data.typeToInfo).map(([key, info]) => [key, info!]);
  }

  private async _prepareData() {
    const furniDataString = await this._getFurniData();
    const parsed = await parseStringPromise(furniDataString);

    const typeToInfo: FurnitureMap = {};
    const floorIdToType: IdToTypeMap = {};
    const wallIdToType: IdToTypeMap = {};

    const register = (data: any[], furnitureType: "floor" | "wall") => {
      data.forEach((element) => {
        const type = element.$.classname;
        const id = element.$.id;

        typeToInfo[type] = formatFurnitureData(element);

        if (furnitureType === "floor") {
          if (floorIdToType[id] != null)
            throw new Error(`Floor furniture with id ${id} already exists`);

          floorIdToType[id] = type;
        } else if (furnitureType === "wall") {
          if (wallIdToType[id] != null)
            throw new Error(`Wall furniture with id ${id} already exists`);

          wallIdToType[id] = type;
        }
      });
    };

    register(parsed.furnidata.roomitemtypes[0].furnitype, "wall");
    register(parsed.furnidata.wallitemtypes[0].furnitype, "floor");

    return { typeToInfo, floorIdToType, wallIdToType };
  }
}
