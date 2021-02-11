import { getAvatarDirection } from "../getAvatarDirection";

test.each([
  [0, 0],
  [1, 1],
  [2, 2],
  [3, 3],
  [4, 4],
  [5, 5],
  [6, 6],
  [7, 7],
  [8, 0],
  [9, 1],
  [10, 2],
  [11, 3],
  [12, 4],
  [13, 5],
  [14, 6],
  [15, 7],
  [16, 0],
  [17, 0],
  [-1, 7],
  [-2, 6],
  [-3, 5],
  [-4, 4],
  [-5, 3],
  [-6, 2],
  [-7, 1],
  [-8, 0],
  [-9, 0],
])(`getAvatarDirection handles direction %s`, (input, output) =>
  expect(getAvatarDirection(input)).toEqual(output)
);
