import { AvatarAction } from "../AvatarAction";
import { AvatarData } from "./AvatarData";
import { IAvatarActionsData, AvatarActionInfo } from "./IAvatarActionsData";

export class AvatarActionsData
  extends AvatarData
  implements IAvatarActionsData {
  getActions(): AvatarActionInfo[] {
    return this.querySelectorAll("action").map((element) =>
      getAvatarActionInfoFromElement(element)
    );
  }

  getAction(id: AvatarAction): AvatarActionInfo | undefined {
    const action = this.querySelector(`action[id="${id}"]`);

    if (action == null) return;

    return getAvatarActionInfoFromElement(action);
  }

  static async fromUrl(url: string) {
    const response = await fetch(url);
    const text = await response.text();

    return new AvatarActionsData(text);
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
