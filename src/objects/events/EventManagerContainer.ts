import * as PIXI from "pixi.js";
import { EventManager } from "./EventManager";

export class EventManagerContainer extends PIXI.Container {
  constructor(
    private _application: PIXI.Application,
    private _eventManager: EventManager
  ) {
    super();

    this.interactive = true;
    this._updateRectangle();

    _application.ticker.add(this._updateRectangle);

    this.addListener("click", (event) => {
      const position = event.data.getLocalPosition(this._application.stage);

      this._eventManager.click(position.x, position.y);
    });

    this.addListener("pointermove", (event) => {
      const position = event.data.getLocalPosition(this._application.stage);

      this._eventManager.move(position.x, position.y);
    });

    this.addListener("pointerup", (event) => {
      const position = event.data.getLocalPosition(this._application.stage);

      this._eventManager.pointerUp(position.x, position.y);
    });

    this.addListener("pointerdown", (event) => {
      const position = event.data.getLocalPosition(this._application.stage);

      this._eventManager.pointerDown(position.x, position.y);
    });
  }

  destroy() {
    super.destroy();

    this._application.ticker.remove(this._updateRectangle);
  }

  private _updateRectangle = () => {
    const renderer = this._application.renderer;

    this.hitArea = new PIXI.Rectangle(
      0,
      0,
      renderer.width / renderer.resolution,
      renderer.height / renderer.resolution
    );
  };
}
