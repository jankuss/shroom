import path from "path";
import { AvatarEffectMap } from "../../objects/avatar/data/AvatarEffectMap";
import {
  downloadFile,
  DownloadFileResult,
  DownloadRequest,
} from "./downloadFile";
import { downloadMultipleFiles } from "./downloadMultipleFiles";
import { Logger } from "./Logger";

export async function downloadEffects(
  {
    downloadPath,
    gordonUrl,
    effectMapDownload,
  }: {
    downloadPath: string;
    gordonUrl: string;
    effectMapDownload: DownloadFileResult;
  },
  logger: Logger
) {
  if (effectMapDownload.type !== "SUCCESS") {
    logger.info(
      "Skipping downloading furniture, since we couldn't download the furniture data."
    );
    return;
  }

  const effectMap = new AvatarEffectMap(await effectMapDownload.text());
  const libs = effectMap.getEffects().map((effect) => effect.lib);

  await downloadMultipleFiles(
    { data: libs, name: "Effects", concurrency: 30, logger },
    async (library, view) => {
      const request: DownloadRequest = {
        url: `${gordonUrl}/${library}.swf`,
        savePath: path.join(downloadPath, `effects`, `${library}.swf`),
      };

      const result = await downloadFile(request);
      switch (result.type) {
        case "SUCCESS":
          view.reportSuccess(library);
          break;

        case "HTTP_ERROR":
        case "FAILED_TO_WRITE":
          view.reportError(library, request, result);
          break;
      }
    }
  );
}
