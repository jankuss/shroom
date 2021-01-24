import { traverseDOMTree } from "../../../../util/traverseDOMTree";
import { AvatarEffect, IAvatarEffectMap } from "./interfaces/IAvatarEffectMap";

export class AvatarEffectMap implements IAvatarEffectMap {
  private _effects: Map<string, AvatarEffect> = new Map();
  private _effectsArray: AvatarEffect[] = [];

  constructor(string: string) {
    const document = new DOMParser().parseFromString(string, "text/xml");

    traverseDOMTree(document, {
      enter: (node) => {
        if (
          node instanceof Element &&
          node.tagName.toLowerCase() === "effect"
        ) {
          const effect = this._getEffectFromElement(node);
          this._effects.set(effect.id, effect);
        }
      },
      exit: () => {},
    });

    this._effectsArray = Array.from(this._effects.values());
  }

  getEffects(): AvatarEffect[] {
    return this._effectsArray;
  }

  getEffectInfo(id: string): AvatarEffect | undefined {
    return this._effects.get(id);
  }

  private _getEffectFromElement(element: Element) {
    const id = element.getAttribute("id");
    const lib = element.getAttribute("lib");
    const type = element.getAttribute("type");

    if (lib == null) throw new Error("Invalid lib for effect");
    if (type == null) throw new Error("Invalid type for effect");
    if (id == null) throw new Error("Invalid id");

    return {
      id,
      lib,
      type,
    };
  }
}
