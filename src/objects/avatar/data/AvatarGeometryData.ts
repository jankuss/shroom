import { getNumberFromAttribute } from "../../../util/getNumberFromAttribute";
import {
  AvatarGeometry,
  Bodypart,
  BodypartItem,
  IAvatarGeometryData,
} from "./interfaces/IAvatarGeometryData";
import { geometryXml } from "./static/geometry.xml";

export class AvatarGeometryData implements IAvatarGeometryData {
  private _bodypartMap: Map<string, Bodypart> = new Map();
  private _avatarSetMap: Map<string, string[]> = new Map();
  private _geometries: Map<string, AvatarGeometry> = new Map();
  private _bodyPartItemMap: Map<string, BodypartItem> = new Map();

  constructor(string: string) {
    const document = new DOMParser().parseFromString(string, "text/xml");

    document
      .querySelectorAll(`canvas[scale="h"] geometry`)
      .forEach((element) => {
        const geometry = this._getGeometryFromElement(element);
        this._geometries.set(geometry.id, geometry);
      });

    document.querySelectorAll(`avatarset`).forEach((element) => {
      const avatarSetId = element.getAttribute("id");
      if (avatarSetId == null) return;

      const bodyParts = element.querySelectorAll(`bodypart`);

      bodyParts.forEach((bodyPart) => {
        const id = bodyPart.getAttribute("id");

        if (id != null) {
          const current = this._avatarSetMap.get(avatarSetId) ?? [];
          this._avatarSetMap.set(avatarSetId, [...current, id]);
        }
      });
    });

    document.querySelectorAll(`type`).forEach((element) => {
      const typeId = element.getAttribute("id");
      if (typeId == null) return;

      element.querySelectorAll(`bodypart`).forEach((bodypart) => {
        const bodyPart = this._getBodyPartFromElement(bodypart);
        if (bodyPart == null) return;

        const bodyPartItems: BodyPartItemFromElement[] = [];

        bodypart.querySelectorAll(`item`).forEach((item) => {
          const bodyPartItem = this._getBodyPartItemFromElement(item);

          if (bodyPartItem != null) {
            bodyPartItems.push(bodyPartItem);
            this._bodyPartItemMap.set(
              `${typeId}_${bodyPart.id}_${bodyPartItem.id}`,
              bodyPartItem
            );
          }
        });

        this._bodypartMap.set(`${typeId}_${bodyPart.id}`, {
          ...bodyPart,
          items: bodyPartItems,
        });
      });
    });
  }

  static async fromUrl(url: string) {
    const response = await fetch(url);
    const text = await response.text();

    return new AvatarGeometryData(text);
  }

  static default() {
    return new AvatarGeometryData(atob(geometryXml));
  }

  getBodyPartItem(
    geometry: string,
    bodyPartId: string,
    itemId: string
  ): BodypartItem | undefined {
    return this._bodyPartItemMap.get(`${geometry}_${bodyPartId}_${itemId}`);
  }

  getBodyPart(geometry: string, bodyPartId: string): Bodypart | undefined {
    return this._bodypartMap.get(`${geometry}_${bodyPartId}`);
  }

  getBodyParts(avaterSet: string): string[] {
    return this._avatarSetMap.get(avaterSet) ?? [];
  }

  getGeometry(geometry: string): AvatarGeometry | undefined {
    return this._geometries.get(geometry);
  }

  private _getGeometryFromElement(element: Element) {
    const id = element.getAttribute("id");
    const width = Number(element.getAttribute("width"));
    const height = Number(element.getAttribute("height"));
    const dx = Number(element.getAttribute("dx"));
    const dy = Number(element.getAttribute("dy"));

    if (id == null) throw new Error("Invalid id");

    return {
      id,
      width,
      height,
      dx,
      dy,
    };
  }

  private _getBodyPartFromElement(item: Element) {
    const id = item.getAttribute("id");
    const z = Number(item.getAttribute("z"));

    if (id == null) return;
    if (isNaN(z)) return;

    return {
      id,
      z,
    };
  }

  private _getBodyPartItemFromElement(
    item: Element
  ): BodyPartItemFromElement | undefined {
    const id = item.getAttribute("id");
    const z = getNumberFromAttribute(item.getAttribute("z"));
    const radius = getNumberFromAttribute(item.getAttribute("radius"));

    if (id == null) return;
    if (z == null) return;
    if (radius == null) return;

    return {
      id,
      z,
      radius,
    };
  }
}

interface BodyPartFromElement {
  id: string;
  z: number;
}

interface BodyPartItemFromElement {
  id: string;
  z: number;
  radius: number;
}
