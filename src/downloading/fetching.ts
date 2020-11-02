import fetch from "node-fetch";

export async function tryFetch(url: string) {
  const response = await fetch(url);

  if (response.status !== 200) {
    throw new Error(
      `Request failed for url ${url}. Status code was: ${response.status}`
    );
  }

  return response;
}

export async function tryFetchString(url: string) {
  const response = await tryFetch(url);

  return await response.text();
}

export async function tryFetchBuffer(url: string) {
  const response = await tryFetch(url);

  return await response.buffer();
}
