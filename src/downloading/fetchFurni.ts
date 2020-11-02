import { tryFetchBuffer } from "./fetching";

export async function fetchFurni(
  dcrUrl: string,
  revision: string,
  name: string
) {
  const blob = await tryFetchBuffer(`${dcrUrl}/${revision}/${name}.swf`);

  return {
    revision,
    name,
    blob
  };
}
