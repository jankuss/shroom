import { IFigureData } from "../data/interfaces/IFigureData";
import { IFigureMapData } from "../data/interfaces/IFigureMapData";
import { ParsedLook } from "./parseLookString";

export function getLibrariesForLook(
  look: ParsedLook,
  {
    figureMap,
    figureData,
  }: { figureMap: IFigureMapData; figureData: IFigureData }
): Set<string> {
  const libraries = new Set<string>();

  const figureParts = Array.from(look).flatMap(([setType, { setId }]) => {
    return (
      figureData
        .getParts(setType, setId.toString())
        ?.map((part) => ({ ...part, setId, setType })) ?? []
    );
  });

  for (const part of figureParts) {
    let libraryId = figureMap.getLibraryOfPart(part.id, part.type);
    if (libraryId != null) {
      const checkParts =
        figureData.getParts(part.setType, part.setId.toString()) ?? [];

      for (const checkPart of checkParts) {
        libraryId = figureMap.getLibraryOfPart(checkPart.id, checkPart.type);
        if (libraryId != null) break;
      }
    }

    if (libraryId != null) {
      libraries.add(libraryId);
    }
  }

  // Add base libraries
  libraries.add("hh_human_face");
  libraries.add("hh_human_item");
  libraries.add("hh_human_body");

  return libraries;
}
