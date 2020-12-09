export function parseFigureMap(figureMapXml: any) {
  const libs: any[] = figureMapXml.map.lib;

  const partToLibrary = new Map<string, string>();
  const libraries: string[] = [];

  libs.forEach((lib: any) => {
    const parts: any[] = lib.part;

    parts.forEach((part) => {
      const uniqueId = getUniqueId(part["$"].id, part["$"].type);
      partToLibrary.set(uniqueId, lib["$"].id);
    });

    libraries.push(lib["$"].id);
  });

  return {
    getLibraryOfPart: (id: string, type: string) =>
      partToLibrary.get(getUniqueId(id, type)),
    libraries,
  };
}

const getUniqueId = (id: string, type: string) => {
  return `${id}_${type}`;
};
