#!/usr/bin/env node

import { render } from "ink";
import React from "react";
import yargs from "yargs";
import { runForwardingServer } from "../tools/proxy/runForwardingServer";
import { App } from "./App";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { hideBin } = require("yargs/helpers");

yargs(hideBin(process.argv))
  .command(
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
  )
  .command(
    "proxy",
    "host a proxy server forwarding WebSocket traffic to an emulator",
    (yargs) => {
      yargs
        .option("port", {
          type: "number",
          describe: "Port for the WebSocket server",
        })
        .option("target-port", {
          type: "number",
          describe: "Port to forward to",
        })
        .option("target-host", {
          type: "string",
          describe: "Target host address",
        })
        .option("prepend-length-prefix", {
          type: "boolean",
          default: false,
          describe: "Sends the length integer as a prefix to the message",
        })
        .option("debug", {
          type: "boolean",
          describe: "Run in debug mode",
          default: false,
        })
        .demandOption(["port"], "Provide a port for the WebSocket server")
        .demandOption(
          ["target-port"],
          "Provide a target port to forward the traffic to"
        );
    },
    (options: {
      _: string[];
      targetPort: number;
      port: number;
      prependLengthPrefix: boolean;
      debug: boolean;
      targetHost?: string;
    }) => {
      runForwardingServer({
        wsPort: options.port,
        targetPort: options.targetPort,
        debug: options.debug,
        prependLengthPrefix: options.prependLengthPrefix,
        targetHost: options.targetHost,
      });
    }
  )
  .strict()
  .demandCommand(1).argv;
