export interface AvatarGeometry {
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
}

export interface IAvatarGeometryData {
  getGeometry(geometry: string): AvatarGeometry | undefined;
  getBodyParts(avaterSet: string): string[];
  getBodyPart(geometry: string, bodyPartId: string): Bodypart | undefined;
}
