export interface IAvatarOffsetsData {
  getOffsets(
    fileName: string
  ): { offsetX: number; offsetY: number } | undefined;
}
