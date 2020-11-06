const createFrames = (count: number, frameRepeat: number) => {
  return repeat(count, 0).flatMap((_, index) => repeat(frameRepeat, index));
};

const repeat = <T>(count: number, value: T) => {
  return new Array<T>(count).fill(value);
};

export const avatarFramesObject = {
  wlk: createFrames(4, 2),
  wav: createFrames(2, 2),
};

export const avatarFrames = new Map(Object.entries(avatarFramesObject));
