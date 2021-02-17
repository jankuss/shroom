import { Observable } from "rxjs";
import { Rectangle } from "../../room/IRoomRectangle";
import { IEventGroup } from "./IEventGroup";

export interface IEventHittable {
  getGroup(): IEventGroup;
  getRectangleObservable(): Observable<Rectangle | undefined>;
  getEventZOrder(): number;
  hits(x: number, y: number): void;
}
