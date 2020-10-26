export function getIntFromHex(str: string) {
  return parseInt(str.replace(/^#/, ""), 16);
}
