import fetch from "node-fetch";
const { parser } = require("keep-a-changelog");
import * as fs from "fs";

const { GIT_VERSION_TAG, DISCORD_WEBHOOK } = process.env;

if (GIT_VERSION_TAG == null) throw new Error("Invalid git version tag");
if (DISCORD_WEBHOOK == null) throw new Error("Invalid webhook");

const versionWithoutV = GIT_VERSION_TAG.slice(1);

function getLatestChangelogMarkdown(): string {
  const changelog = parser(fs.readFileSync("../../CHANGELOG.md", "utf-8"));

  const matchingRelease = changelog.releases.find((release: any) => {
    return release.version.version === versionWithoutV;
  });

  return "```" + matchingRelease.toString() + "```";
}

const packageName = "@jankuss/shroom";

const content = {
  content: "A new version of shroom has been released.",
  embeds: [
    {
      title: `shroom ${GIT_VERSION_TAG}`,
      description: `The following changes have been made. You can view the full CHANGELOG [here](https://github.com/jankuss/shroom/blob/${GIT_VERSION_TAG}/CHANGELOG.md). ${getLatestChangelogMarkdown()}`,
      url: `https://www.npmjs.com/package/${packageName}/v/${versionWithoutV}`,
      fields: [
        {
          name: "Download with npm",
          value: `Download the new version with [npm](https://www.npmjs.com/package/${packageName}/v/${versionWithoutV}).`,
        },
        {
          name: "Report Issues",
          value:
            "Please report any bugs or issues with this version on our [Github Issues](https://github.com/jankuss/shroom/issues).",
        },
        {
          name: "Need help?",
          value: "Ask questions in the #support channel.",
        },
      ],
      author: {
        name: "jankuss",
        url: "https://github.com/jankuss",
        icon_url: "https://avatars0.githubusercontent.com/u/1659532",
      },
    },
  ],
};

const body = JSON.stringify(content);

fetch(DISCORD_WEBHOOK, {
  method: "POST",
  body,
  headers: { "Content-Type": "application/json" },
}).catch(console.error);
