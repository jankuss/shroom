import { exec, ExecException } from "child_process";
import * as path from "path";

function execute(command: string) {
  return new Promise((resolve, reject) =>
    exec(
      command,
      { maxBuffer: 1024 * 1024 },
      (error: ExecException | null, stdout: string, stderr: string) =>
        error ? reject(error) : resolve(stdout)
    )
  );
}

function getExtension(str: string) {
  switch (str) {
    case "DEFINEBITSLOSSLESS2":
      return ["-p", "png"] as const;
    case "DEFINEBINARY":
      return ["-b", "bin"] as const;
  }
}

export async function extractSwf(
  out: string,
  swf: string,
  preserveFileNameFor: ("bin" | "png")[] = []
) {
  const result: string = (await execute(`swfdump ${swf}`)) as any;
  const regexIds = /\[.*\]\s*[0-9]*\s*(.*) defines id ([0-9]*)/gm;
  const regexNames = /exports ([0-9]*) as "(.*)"/gm;

  const images: { id: number; type: string; files: any[] }[] = [];
  const map = new Map<number, string[]>();

  let match: any = regexIds.exec(result);
  let matchNames: any = regexNames.exec(result);

  while (match && matchNames) {
    const id = +match[2];
    const type = match[1];

    if (matchNames) {
      const key = +matchNames[1];
      const current = map.get(key);

      if (current && map.has(key)) {
        map.set(key, [...current, matchNames[2]]);
      } else {
        map.set(key, [matchNames[2]]);
      }
    }

    images.push({ id, type, files: map.get(id) ?? [] });

    match = regexIds.exec(result);
    matchNames = regexNames.exec(result);
  }

  for (let i = 0; i < images.length; i++) {
    const { id, type, files = [] } = images[i];

    for (let j = 0; j < files.length; j++) {
      const file = files[j];
      const fileName = getExtension(type);

      const swfName = path.basename(swf, ".swf");

      if (fileName && file) {
        const realFileName = !preserveFileNameFor.includes(fileName[1])
          ? file.replace(`${swfName}_`, "")
          : file;

        try {
          await execute(
            `swfextract ${fileName[0]} ${id} -o ${path.resolve(
              path.join(out, `${realFileName}.${fileName[1]}`)
            )} ${path.resolve(swf)}`
          );
        } catch (e) {}
      }
    }
  }
}
