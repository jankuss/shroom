import { IRoomContext } from "./IRoomContext";
import { Room } from "./Room";

export interface IRoomObject {
  setParent(room: IRoomContext): void;
  destroy(): void;
}
