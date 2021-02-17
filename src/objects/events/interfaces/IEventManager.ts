import { IEventManagerNode } from "./IEventManagerNode";
import { IEventTarget } from "./IEventTarget";

export interface IEventManager {
  register(target: IEventTarget): IEventManagerNode;
  remove(target: IEventTarget): void;
}
