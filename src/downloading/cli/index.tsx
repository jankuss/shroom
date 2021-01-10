#!/usr/bin/env node

import { render } from "ink";
import React from "react";
import yargs from "yargs";
import { App } from "./App";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { hideBin } = require("yargs/helpers");

yargs(hideBin(process.argv)).command(
  "dump",
  "dump external variables",
  (yargs) => {
    yargs
      .option("url", {
        type: "string",
        describe: "Url to external variables",
      })
      .option("location", {
        type: "string",
        describe: "Path to store the extracted resources",
      })
      .demandOption(["url"], "Provide a url to the external variables")
      .demandOption(
        ["location"],
        "Provide a location to store the extracted resources"
      );
  },
  (options: { url: string; location: string }) => {
    render(
      <App
        externalVariablesUrl={options.url}
        steps={{
          figureData: true,
          figureMap: true,
          furniData: true,
          figureAssets: true,
          furniAssets: true,
        }}
        location={options.location}
      />
    );
  }
).argv;
