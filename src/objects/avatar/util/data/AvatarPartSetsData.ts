import { AvatarData } from "./AvatarData";
import { IAvatarPartSetsData } from "./IAvatarPartSetsData";

export class AvatarPartSetsData
  extends AvatarData
  implements IAvatarPartSetsData {
  constructor(xml: string) {
    super(xml);
  }

  getActivePartSet(id: string) {
    const partSet = this.querySelectorAll(
      `activePartSet[id="${id}"] activePart`
    );

    return partSet.map((value) => {
      const setType = value.getAttribute("set-type");
      if (setType == null) throw new Error("Invalid set type");

      return setType;
    });
  }
}
