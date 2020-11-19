export interface IAnimationTicker {
  subscribe(cb: (frame: number, accurateFrame: number) => void): () => void;
  current(): number;
}
