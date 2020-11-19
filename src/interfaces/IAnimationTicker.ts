export interface IAnimationTicker {
  subscribe(cb: (frame: number) => void): () => void;
  current(): number;
}
