import { FurnitureInfo, IFurnitureData } from "./interfaces/IFurnitureData";
import { parseStringPromise } from "xml2js";
import { formatFurnitureData } from "./util/furnitureDataTransformers";
import { IFurniture } from "./objects/furniture/IFurniture";

type FurnitureMap = {
  [key: string]: FurnitureInfo | undefined;
};

export class FurnitureData implements IFurnitureData {
  private data: Promise<FurnitureMap>;

  constructor(private getFurniData: () => Promise<string>) {
    this.data = this.prepareData();
  }

  private async prepareData() {
    const furniDataString = await this.getFurniData();
    const parsed = await parseStringPromise(furniDataString);

    const typeToInfo: FurnitureMap = {};

    const register = (data: any[]) => {
      data.forEach((element) => {
        typeToInfo[element["$"].classname] = formatFurnitureData(element);
      });
    };

    register(parsed.furnidata.roomitemtypes[0].furnitype);
    register(parsed.furnidata.wallitemtypes[0].furnitype);

    return typeToInfo;
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
    return data[type];
  }

  async getInfoForFurniture(furniture: IFurniture) {
    return this.getInfo(furniture.type);
  }
}
