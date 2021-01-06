import axios, {
  AxiosRequestConfig,
  AxiosResponse,
  Canceler,
  CancelTokenStatic,
} from "axios";

const STUCKED_DOWNLOAD_WATCHER_TIMEOUT = 2000;
const MAX_TIMEOUT = 10000;
const MAX_TIMEOUT_ATTEMPTS = 5;
const MAX_RETRIES = 3;

export async function tryFetch(
  url: string,
  responseType: AxiosRequestConfig["responseType"],
  retries?: number
): Promise<AxiosResponse> {
  if (retries && retries >= MAX_RETRIES)
    throw new Error(`Maximum download attempts exceeded ${url}`);

  let downloaded = false;
  let response: AxiosResponse | undefined;

  const instance = axios.create({
    url,
    responseType,
    timeout: MAX_TIMEOUT,
    validateStatus: () => true,
  });

  const cancelToken: CancelTokenStatic = axios.CancelToken;
  let cancel: Canceler | undefined = undefined;
  let attempts: number = 0;

  let watcher = (url: string) =>
    setInterval(() => {
      attempts++;

      if (attempts >= MAX_TIMEOUT_ATTEMPTS) {
        if (stuckedDownload) {
          clearTimeout(stuckedDownload);
        }

        cancel && cancel(`Request aborted due to timeout: ${url}`);
      }
    }, STUCKED_DOWNLOAD_WATCHER_TIMEOUT);

  let stuckedDownload: NodeJS.Timeout | undefined;
  const clearWatcher = () => stuckedDownload && clearInterval(stuckedDownload);

  while (!downloaded) {
    try {
      if (downloaded) break;

      stuckedDownload = watcher(url);

      response = await instance.get(url, {
        cancelToken: new cancelToken((c) => {
          cancel = c;
        }),
      });

      if (response) {
        downloaded = true;

        clearWatcher();
      }
    } catch (e) {
      if (e instanceof axios.Cancel) {
        return tryFetch(url, responseType, (retries && retries++) ?? 1);
      }

      clearWatcher();
    }
  }

  if (!response) {
    throw new Error(`Response not found for ${url}`);
  }

  if (response && response.status !== 200) {
    throw new Error(
      `Request failed for url ${url}. Status code was: ${response.status}`
    );
  }

  return response;
}

export async function tryFetchString(url: string) {
  const response = await tryFetch(url, "text");

  return await response.data;
}

export async function tryFetchBuffer(url: string) {
  const response = await tryFetch(url, "arraybuffer");

  return await response.data;
}
