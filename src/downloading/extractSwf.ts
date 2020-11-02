import { exec } from "child_process";
import * as path from "path";

function execute(command: string) {
  return new Promise((resolve, reject) =>
    exec(command, (error, stdout, stderr) =>
      error || stderr.length > 0 ? reject(error) : resolve(stdout)
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

  const arr: [string, number][] = [];
  let match: any;
  do {
    match = regexIds.exec(result);
    if (match) {
      arr.push([match[1], Number(match[2])]);
    }
  } while (match);

  const map = new Map<number, string[]>();
  do {
    match = regexNames.exec(result);
    if (match) {
      const key = Number(match[1]);
      const current = map.get(key);

      if (current) {
        map.set(key, [...current, match[2]]);
      } else {
        map.set(key, [match[2]]);
      }
    }
  } while (match);

  const results = arr.map(([type, id]) => ({ type, files: map.get(id), id }));

  for (let i = 0; i < results.length; i++) {
    const { id, type, files = [] } = results[i];

    for (let j = 0; j < files.length; j++) {
      const file = files[j];
      const fileName = getExtension(type);

      const swfName = path.basename(swf, ".swf");

      if (fileName != null && file != null) {
        const realFileName = !preserveFileNameFor.includes(fileName[1])
          ? file.replace(`${swfName}_`, "")
          : file;

        try {
          await execute(
            `swfextract ${fileName[0]} ${id} -o ${path.resolve(
              path.join(out, `${realFileName}.${fileName[1]}`)
            )} ${path.resolve(swf)}`
          );
        } catch (e) {
          console.error("Error");
        }
      }
    }
  }
}
