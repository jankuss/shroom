import { IEventHandler } from "./IEventHandler";
import { IEventHittable } from "./IEventHittable";

export interface IEventTarget extends IEventHittable, IEventHandler {}
