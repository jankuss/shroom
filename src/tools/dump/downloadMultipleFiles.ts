import { DownloadFileResult, DownloadRequest } from "./downloadFile";
import { Logger } from "./Logger";
import { getDownloadMessage } from "./downloadFileWithMessage";
import Bluebird from "bluebird";
import { ProgressBar } from "./ProgressBar";

export async function downloadMultipleFiles<T>(
  {
    data,
    name,
    concurrency,
    logger,
  }: {
    data: T[];
    concurrency: number;
    logger: Logger;
    name: string;
  },
  map: (data: T, view: IView) => Promise<void>
) {
  const downloadProgress = new ProgressBar(
    logger,
    data.length,
    (current, count, extra) => {
      if (extra != null) {
        return `${name}: ${current} / ${count} downloaded (${extra})`;
      } else {
        return `${name}: ${current} / ${count} downloaded`;
      }
    }
  );

  const reportSuccess = (lastLibrary: string) => {
    downloadProgress.increment(lastLibrary);
  };

  const reportError = (
    errorLibrary: string,
    request: DownloadRequest,
    result: DownloadFileResult
  ) => {
    downloadProgress.error(
      `${errorLibrary} - ${getDownloadMessage(request, result)}`
    );
  };

  const reportDone = () => {
    downloadProgress.done();
  };

  await Bluebird.map(
    data,
    async (data) => {
      await map(data, { reportError, reportSuccess });
    },
    { concurrency: concurrency }
  );

  reportDone();
}

interface IView {
  reportSuccess(value: string): void;
  reportError(
    value: string,
    request: DownloadRequest,
    response: DownloadFileResult
  ): void;
}
