import {
  FurnitureId,
  FurnitureInfo,
  IFurnitureData,
} from "../interfaces/IFurnitureData";
import { parseStringPromise } from "xml2js";
import { formatFurnitureData } from "../util/furnitureDataTransformers";
import { IFurniture } from "./furniture/IFurniture";

type FurnitureMap = {
  [key: string]: FurnitureInfo | undefined;
};

type IdToTypeMap = {
  [key: string]: string | undefined;
};

export class FurnitureData implements IFurnitureData {
  private data: Promise<{ typeToInfo: FurnitureMap; idToType: IdToTypeMap }>;

  constructor(private getFurniData: () => Promise<string>) {
    this.data = this.prepareData();
  }

  private async prepareData() {
    const furniDataString = await this.getFurniData();
    const parsed = await parseStringPromise(furniDataString);

    const typeToInfo: FurnitureMap = {};
    const idToType: IdToTypeMap = {};

    const register = (data: any[]) => {
      data.forEach((element) => {
        const type = element.$.classname;
        const id = element.$.id;

        typeToInfo[type] = formatFurnitureData(element);
        idToType[id] = type;
      });
    };

    register(parsed.furnidata.roomitemtypes[0].furnitype);
    register(parsed.furnidata.wallitemtypes[0].furnitype);

    return { typeToInfo, idToType };
  }

  static create(resourcePath: string = "") {
    return new FurnitureData(async () =>
      fetch(`${resourcePath}/furnidata.xml`).then((response) => response.text())
    );
  }

  async getRevisionForType(type: string): Promise<number | undefined> {
    const info = await this.getInfo(type);

    return info?.revision;
  }

  async getInfo(type: string): Promise<FurnitureInfo | undefined> {
    const data = await this.data;
    return data.typeToInfo[type];
  }

  async getTypeById(id: FurnitureId): Promise<string | undefined> {
    const data = await this.data;
    const type = data.idToType[id];

    if (type == null) return;

    return type;
  }

  async getInfoForFurniture(furniture: IFurniture) {
    if (furniture.id != null) {
      const type = await this.getTypeById(furniture.id);

      if (type != null) {
        return this.getInfo(type);
      }
    }

    if (furniture.type != null) {
      return this.getInfo(furniture.type);
    }
  }
}
