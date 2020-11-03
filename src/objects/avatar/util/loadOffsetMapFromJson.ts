import { GetOffset } from "./loadOffsetMap";

export function loadOffsetMapFromJson(json: any): { getOffset: GetOffset } {
  return {
    getOffset: name => json[name]
  };
}
