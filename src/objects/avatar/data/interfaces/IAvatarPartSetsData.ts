export interface IAvatarPartSetsData {
  getActivePartSet(id: string): Set<string>;
  getPartInfo(
    id: string
  ): { removeSetType?: string; flippedSetType?: string } | undefined;
}
