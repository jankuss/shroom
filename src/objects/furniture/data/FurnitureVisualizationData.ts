import { XmlData } from "../../../data/XmlData";
import { notNullOrUndefined } from "../../../util/notNullOrUndefined";
import {
  FurnitureAnimationsJson,
  FurnitureColorsJson,
  FurnitureDirectionsJson,
  FurnitureLayersJson,
  FurnitureVisualizationJson,
} from "./FurnitureVisualizationJson";
import {
  FurnitureAnimationLayer,
  FurnitureDirectionLayer,
  IFurnitureVisualizationData,
  FurnitureLayer,
  FurnitureAnimation,
} from "./interfaces/IFurnitureVisualizationData";

export class FurnitureVisualizationData
  extends XmlData
  implements IFurnitureVisualizationData {
  constructor(xml: string) {
    super(xml);
  }

  static async fromUrl(url: string) {
    const response = await fetch(url);
    const text = await response.text();

    return new FurnitureVisualizationData(text);
  }

  getFrameCountWithoutRepeat(
    size: number,
    animationId: number
  ): number | undefined {
    const frameSequences = this.querySelectorAll(
      `visualization[size="${size}"] animation[id="${animationId}"] frameSequence`
    );

    let count: number | undefined;
    frameSequences.forEach((element) => {
      const value = element.children.length;

      if (count == null || value > count) {
        count = value;
      }
    });

    return count;
  }

  getTransitionForAnimation(
    size: number,
    transitionTo: number
  ): FurnitureAnimation | undefined {
    const animation = this.querySelector(
      `visualization[size="${size}"] animations animation[transitionTo="${transitionTo}"]`
    );

    const animationId = Number(animation?.getAttribute("id") ?? undefined);

    if (isNaN(animationId)) {
      return;
    }

    return {
      id: animationId,
      transitionTo,
    };
  }

  getAnimation(
    size: number,
    animationId: number
  ): FurnitureAnimation | undefined {
    const animation = this.querySelector(
      `visualization[size="${size}"] animations animation[id="${animationId}"]`
    );

    if (animation == null) return;

    const transitionAnimationId = Number(
      animation?.getAttribute("transitionTo") ?? undefined
    );

    return {
      id: animationId,
      transitionTo: isNaN(transitionAnimationId)
        ? undefined
        : transitionAnimationId,
    };
  }

  getColor(size: number, colorId: number, layerId: number) {
    const colorElement = this.querySelector(
      `visualization[size="${size}"] colors color[id="${colorId}"] colorLayer[id="${layerId}"]`
    );

    return colorElement?.getAttribute("color") ?? undefined;
  }

  getFrameCount(size: number, animationId: number): number | undefined {
    const frameSequences = this.querySelectorAll(
      `visualization[size="${size}"] animation[id="${animationId}"] frameSequence`
    );

    let count: number | undefined;
    frameSequences.forEach((element) => {
      const parent = element.parentElement;
      const multiplier = Number(parent?.getAttribute("frameRepeat") ?? "1");

      const value = element.children.length * multiplier;

      if (count == null || value > count) {
        count = value;
      }
    });

    return count;
  }

  getAnimationIds(size: number) {
    const animations = this.querySelectorAll(
      `visualization[size="${size}"] animations animation`
    );

    return animations
      .map((element) => element.getAttribute("id"))
      .filter(notNullOrUndefined)
      .map((id) => Number(id));
  }

  getAnimationLayer(
    size: number,
    animationId: number,
    id: number
  ): FurnitureAnimationLayer | undefined {
    const animationLayer = this.querySelector(
      `visualization[size="${size}"] animations animation[id="${animationId}"] animationLayer[id="${id}"]`
    );

    if (animationLayer == null) return;
    const frameRepeat = Number(
      animationLayer.getAttribute("frameRepeat") ?? undefined
    );
    const loopCount = Number(
      animationLayer.getAttribute("loopCount") ?? undefined
    );

    const frames = Array.from(
      animationLayer.querySelectorAll(`frameSequence frame`)
    );

    return {
      id: animationId,
      frames: frames.map((element) =>
        Number(element.getAttribute("id") ?? undefined)
      ),
      frameRepeat: isNaN(frameRepeat) ? undefined : frameRepeat,
      loopCount: isNaN(loopCount) ? undefined : loopCount,
    };
  }

  getDirections(size: number): number[] {
    const directions = this.querySelectorAll(
      `visualization[size="${size}"] directions direction`
    );

    return directions.map((element) => {
      const id = element.getAttribute("id") ?? undefined;

      return Number(id);
    });
  }

  getDirectionLayer(
    size: number,
    direction: number,
    layerId: number
  ): FurnitureDirectionLayer | undefined {
    const directionLayer = this.querySelector(
      `visualization[size="${size}"] directions direction[id="${direction}"] layer[id="${layerId}"]`
    );

    if (directionLayer == null) return;
    const z = this._getNumberFromAttributeValue(
      directionLayer.getAttribute("z")
    );
    const x = this._getNumberFromAttributeValue(
      directionLayer.getAttribute("x")
    );
    const y = this._getNumberFromAttributeValue(
      directionLayer.getAttribute("y")
    );

    return {
      z: z,
      x: x,
      y: y,
    };
  }

  getLayerCount(size: number) {
    const visualization = this.querySelector(`visualization[size="${size}"]`);
    if (visualization == null) throw new Error("Invalid visualization");

    return Number(visualization.getAttribute("layerCount") ?? undefined);
  }

  getLayer(size: number, layerId: number): FurnitureLayer | undefined {
    const layerElement = this.querySelector(
      `visualization[size="${size}"] layers layer[id="${layerId}"]`
    );

    if (layerElement == null) return;

    const id = layerElement.getAttribute("id") ?? undefined;
    const z = layerElement.getAttribute("z") ?? undefined;
    const tag = layerElement.getAttribute("tag") ?? undefined;
    const alpha = layerElement.getAttribute("alpha") ?? undefined;
    const ink = layerElement.getAttribute("ink") ?? undefined;
    const ignoreMouse = layerElement.getAttribute("ignoreMouse") ?? undefined;

    const idNumber = Number(id);
    const zNumber = Number(z);
    const alphaNumber = Number(alpha);

    if (isNaN(idNumber)) throw new Error("Invalid layer id");

    return {
      id: idNumber,
      z: isNaN(zNumber) ? 0 : zNumber,
      alpha: isNaN(alphaNumber) ? undefined : alphaNumber,
      tag: tag ?? undefined,
      ink: ink ?? undefined,
      ignoreMouse: ignoreMouse != null ? ignoreMouse === "1" : undefined,
    };
  }

  toJson(): FurnitureVisualizationJson {
    return {
      ...this._getJsonForSize(64),
    };
  }

  private _toJsonMap<T>(
    arr: T[],
    getKey: (value: T) => string | null
  ): { [key: string]: T | undefined } {
    const map: any = {};

    arr.forEach((value) => {
      const key = getKey(value);

      if (key != null) {
        map[key] = value;
      }
    });

    return map;
  }

  private _getJsonAnimations(size: number): FurnitureAnimationsJson {
    const arr = Array.from(
      this.document.querySelectorAll(
        `visualization[size="${size}"] animations animation`
      )
    )
      .map((element) => {
        const layers = Array.from(element.querySelectorAll(`animationLayer`))
          .map((element): FurnitureAnimationLayer | undefined => {
            const id = this._getNumberFromAttributeValue(
              element.getAttribute("id")
            );

            const frames = Array.from(
              element.querySelectorAll(`frame` as string)
            )
              .map((element) => element.getAttribute("id"))
              .filter(notNullOrUndefined)
              .map((id) => Number(id));

            const frameRepeat = this._getNumberFromAttributeValue(
              element.getAttribute("frameRepeat")
            );
            const loopCount = this._getNumberFromAttributeValue(
              element.getAttribute("loopCount")
            );
            const random =
              this._getNumberFromAttributeValue(
                element.getAttribute("random")
              ) === 1;

            if (id == null) return;

            return {
              id,
              frames,
              frameRepeat,
              loopCount,
              random,
            };
          })
          .filter(notNullOrUndefined);

        const animationId = this._getNumberFromAttributeValue(
          element.getAttribute("id")
        );

        const transitionTo = this._getNumberFromAttributeValue(
          element.getAttribute("transitionTo")
        );

        if (animationId == null) return null;

        return {
          id: animationId,
          layers: this._toJsonMap(layers, (layer) => layer.id.toString()),
          transitionTo,
        };
      })
      .filter(notNullOrUndefined);

    return this._toJsonMap(arr, (element) => element.id.toString());
  }

  private _getJsonColors(size: number): FurnitureColorsJson {
    const arr = Array.from(
      this.document.querySelectorAll(
        `visualization[size="${size}"] colors color`
      )
    ).map((element) => {
      const colorId = element.getAttribute("id");
      const colorLayers = Array.from(
        element.querySelectorAll("colorLayer")
      ).map((element) => {
        const layerId = element.getAttribute("id");
        const color = element.getAttribute("color");

        if (color == null) throw new Error("Invalid color");

        return {
          id: layerId,
          color,
        };
      });

      return {
        id: colorId,
        layers: this._toJsonMap(colorLayers, (layer) => layer.id),
      };
    });

    return this._toJsonMap(arr, (value) => value.id);
  }

  private _getDirections(size: number): FurnitureDirectionsJson {
    const arr = Array.from(
      this.document.querySelectorAll(
        `visualization[size="${size}"] directions direction`
      )
    ).map((element) => {
      const id = element.getAttribute("id");
      const layers = Array.from(element.querySelectorAll("layer")).map(
        (element) => {
          const id = element.getAttribute("id");
          const x = this._getNumberFromAttributeValue(
            element.getAttribute("x")
          );
          const y = this._getNumberFromAttributeValue(
            element.getAttribute("y")
          );
          const z = this._getNumberFromAttributeValue(
            element.getAttribute("z")
          );

          return {
            id,
            x,
            y,
            z,
          };
        }
      );

      return {
        id,
        layers: this._toJsonMap(layers, (layer) => layer.id),
      };
    });

    return this._toJsonMap(arr, (direction) => direction.id);
  }

  private _getLayers(size: number): FurnitureLayersJson {
    const arr = Array.from(
      this.document.querySelectorAll(
        `visualization[size="${size}"] layers layer`
      )
    ).map(
      (element): FurnitureLayer => {
        const id = this._getNumberFromAttributeValue(
          element.getAttribute("id")
        );
        const ink = element.getAttribute("ink") ?? undefined;
        const alpha = this._getNumberFromAttributeValue(
          element.getAttribute("alpha")
        );
        const z = this._getNumberFromAttributeValue(element.getAttribute("z"));
        const ignoreMouse =
          this._getNumberFromAttributeValue(
            element.getAttribute("ignoreMouse")
          ) === 1;
        const tag = element.getAttribute("tag") ?? undefined;

        if (id == null) throw new Error("Invalid id");

        return {
          id,
          z: z ?? 0,
          alpha,
          ignoreMouse,
          ink,
          tag,
        };
      }
    );

    return this._toJsonMap(arr, (layer) => layer.id.toString());
  }

  private _getJsonForSize(size: number): FurnitureVisualizationJson {
    return {
      [size.toString()]: {
        layerCount: this.getLayerCount(size),
        animations: this._getJsonAnimations(size),
        colors: this._getJsonColors(size),
        directions: this._getDirections(size),
        layers: this._getLayers(size),
      },
    };
  }

  private _getNumberFromAttributeValue(value: string | null) {
    if (value == null) return undefined;
    const numberValue = Number(value);

    if (isNaN(numberValue)) return undefined;

    return numberValue;
  }
}
