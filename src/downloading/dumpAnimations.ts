import { promises as fs } from "fs";
import * as xml from "xml2js";

export interface AnimationsXml {
  animationSet: {
    action: {
      $: { id: string };
      part: {
        $: { "set-type": string };
        frame: {
          $: { number: string; assetpartdefinition: string; repeats?: string };
        }[];
      }[];
      offsets?: {
        frame: {
          $: { id: string; repeats?: string };
          directions: {
            direction: {
              $: { id: string };
              bodypart: { $: { id: string; dx: string; dy: string } }[];
            }[];
          }[];
        }[];
      }[];
    }[];
  };
}

export async function dumpAnimation() {
  const content = await fs.readFile(
    "./resources/HabboAvatarRenderLib_HabboAvatarAnimation.bin"
  );

  const contentString = content.toString("utf-8");
  const obj: AnimationsXml = await xml.parseStringPromise(contentString);

  console.log(JSON.stringify(obj));
}
