export interface IFigureMapData {
  getLibraryOfPart(id: string, type: string): string | undefined;
  getLibraries(): string[];
}
