import { FurnitureId } from "../../../interfaces/IFurnitureData";
import { FurnitureFetch } from "../../../interfaces/IFurnitureLoader";
import { FurnitureFetchInfo } from "../FurnitureFetchInfo";

export function getFurnitureFetch(data: FurnitureFetchInfo): FurnitureFetch {
  if (data.id != null && data.type != null)
    throw new Error(
      "Both `id` and `type` specified. Please supply only one of the two."
    );

  if (data.id != null) {
    return { kind: "id", id: data.id };
  }

  if (data.type != null) {
    return { kind: "type", type: data.type };
  }

  throw new Error("No `id` or `type` provided for the furniture.");
}
