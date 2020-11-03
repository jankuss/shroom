export function parseFigureMap(figureMapXml: any) {
  const libs: any[] = figureMapXml.map.lib;

  return libs.map((lib: any) => {
    return lib["$"].id as string;
  });
}
