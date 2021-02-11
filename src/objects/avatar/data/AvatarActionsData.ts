import { AvatarAction } from "../enum/AvatarAction";
import {
  IAvatarActionsData,
  AvatarActionInfo,
} from "./interfaces/IAvatarActionsData";
import { actionsXml } from "./static/actions.xml";

export class AvatarActionsData implements IAvatarActionsData {
  private _map = new Map<string, AvatarActionInfo>();
  private _handItems = new Map<string, number>();

  constructor(xml: string) {
    const document = new DOMParser().parseFromString(xml, "text/xml");

    document.querySelectorAll(`action`).forEach((action) => {
      const actionId = action.getAttribute("id");
      if (actionId == null) return;

      const info = getAvatarActionInfoFromElement(action);
      this._map.set(actionId, info);

      action.querySelectorAll(`param`).forEach((param) => {
        const paramId = param.getAttribute("id");
        if (paramId == null) return;

        const value = Number(param?.getAttribute("value"));
        if (isNaN(value)) return;

        this._handItems.set(`${actionId}_${paramId}`, value);
      });
    });
  }

  static async fromUrl(url: string) {
    const response = await fetch(url);
    const text = await response.text();

    return new AvatarActionsData(text);
  }

  static default() {
    return new AvatarActionsData(atob(actionsXml));
  }

  getHandItemId(actionId: string, id: string): number | undefined {
    return this._handItems.get(`${actionId}_${id}`);
  }

  getActions(): AvatarActionInfo[] {
    return Array.from(this._map.values());
  }

  getAction(id: AvatarAction): AvatarActionInfo | undefined {
    return this._map.get(id);
  }
}

function getAvatarActionInfoFromElement(action: Element) {
  const id = action.getAttribute("id");
  const state = action.getAttribute("state");
  const precedenceString = action.getAttribute("precedence");
  const geometrytype = action.getAttribute("geometrytype");
  const activepartset = action.getAttribute("activepartset");
  const assetpartdefinition = action.getAttribute("assetpartdefinition");
  const preventsString = action.getAttribute("prevents");
  const animation = action.getAttribute("animation");
  const main = action.getAttribute("main");
  const isdefault = action.getAttribute("isdefault");

  if (id == null) throw new Error("Invalid id");
  if (state == null) throw new Error("Invalid state");
  if (precedenceString == null) throw new Error("Invalid precedence");
  if (geometrytype == null) throw new Error("Invalid geometry type");
  if (assetpartdefinition == null)
    throw new Error("Invalid asset part definition");

  const prevents = preventsString?.split(",") ?? [];

  const precedence = Number(precedenceString);

  if (isNaN(precedence)) throw new Error("Invalid precedence");

  return {
    id,
    state,
    precedence,
    geometrytype,
    activepartset,
    assetpartdefinition,
    prevents,
    animation: animation === "1",
    main: main === "1",
    isdefault: isdefault === "1",
  };
}
