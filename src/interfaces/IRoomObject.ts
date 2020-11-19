import { IRoomContext } from "./IRoomContext";

export interface IRoomObject {
  setParent(room: IRoomContext): void;
  destroy(): void;
}
