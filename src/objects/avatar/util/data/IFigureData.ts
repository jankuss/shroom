export interface IFigureData {
  getColor(setType: string, colorId: string): string | undefined;
  getParts(setType: string, id: string): FigureDataPart[] | undefined;
}

export type FigureDataPart = {
  id: string;
  colorable: boolean;
  type: string;
};
