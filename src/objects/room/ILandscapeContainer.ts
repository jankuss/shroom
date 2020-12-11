import { ILandscape } from "./ILandscape";

export interface ILandscapeContainer {
  setLandscape(landscape: ILandscape): void;
  unsetLandscapeIfEquals(landscape: ILandscape): void;
}
