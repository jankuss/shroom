export interface AvatarGeometry {
  id: string;
  width: number;
  height: number;
  dx: number;
  dy: number;
}

export interface Bodypart {
  id: string;
  z: number;
  items: BodypartItem[];
}

export interface BodypartItem {
  id: string;
  z: number;
  radius: number;
}

export interface IAvatarGeometryData {
  getGeometry(geometry: string): AvatarGeometry | undefined;
  getBodyParts(avaterSet: string): string[];
  getBodyPart(geometry: string, bodyPartId: string): Bodypart | undefined;
  getBodyPartItem(
    geometry: string,
    bodyPartId: string,
    itemId: string
  ): BodypartItem | undefined;
}
