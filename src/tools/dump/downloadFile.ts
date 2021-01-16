import { promises as fs } from "fs";
import fetch, { Response } from "node-fetch";
import * as path from "path";

function makeAbsolute(url: string) {
  if (url.slice(0, 2) === "//") {
    return `http:${url}`;
  }

  return url;
}

export async function fetchRetry(url: string) {
  let response: Response | undefined;
  let count = 0;

  do {
    try {
      response = await fetch(url);
    } catch (e) {
      // Ignore network error
    }

    await new Promise((resolve) => setTimeout(resolve, count * 5000));

    count++;
  } while ((response == null || response.status >= 500) && count < 20);

  return response;
}

export async function downloadFile({
  url,
  savePath,
}: DownloadRequest): Promise<DownloadFileResult> {
  url = makeAbsolute(url);
  const response = await fetchRetry(url);

  if (response == null) {
    return {
      type: "RETRY_FAILED",
    };
  }

  if (response.status >= 200 && response.status < 300) {
    try {
      await fs.mkdir(path.dirname(savePath), { recursive: true });
      const buffer = await response.buffer();
      await fs.writeFile(savePath, buffer);

      return {
        type: "SUCCESS",
        text: async () => buffer.toString("utf-8"),
      };
    } catch (e) {
      return {
        type: "FAILED_TO_WRITE",
      };
    }
  }

  return {
    type: "HTTP_ERROR",
    code: response.status,
  };
}

export type DownloadRequest = { url: string; savePath: string };

export type DownloadFileResult =
  | { type: "SUCCESS"; text: () => Promise<string> }
  | { type: "FAILED_TO_WRITE" }
  | { type: "HTTP_ERROR"; code: number }
  | { type: "RETRY_FAILED" };
