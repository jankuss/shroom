export interface IFigureData {
  getColor(setType: string, colorId: string): string | undefined;
  getParts(setType: string, id: string): FigureDataPart[] | undefined;
  getHiddenLayers(setType: string, id: string): string[];
}

export type FigureDataPart = {
  id: string;
  colorable: boolean;
  type: string;
  index: number;
};
