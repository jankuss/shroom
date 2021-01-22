#!/usr/bin/env node

import yargs from "yargs";
import { JSDOM } from "jsdom";

import { dump } from "../tools/dump/dump";
import { runForwardingServer } from "../tools/proxy/runForwardingServer";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { hideBin } = require("yargs/helpers");

const jsdom = new JSDOM();

global.DOMParser = jsdom.window.DOMParser;

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
        .demandOption(
          ["location"],
          "Provide a location to store the extracted resources"
        );
    },
    (options: { url?: string; location: string }) => {
      dump({
        externalVariables: options.url,
        downloadPath: options.location,
      }).catch(console.error);
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
        .option("key", {
          type: "string",
          describe: "Path to key for secure websocket"
        })
        .option("cert", {
          type: "string",
          describe: "Certificate for secure websocket"
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
      cert?: string;
      key?: string;
      targetHost?: string;
    }) => {
      runForwardingServer({
        wsPort: options.port,
        targetPort: options.targetPort,
        debug: options.debug,
        prependLengthPrefix: options.prependLengthPrefix,
        targetHost: options.targetHost,
        keyPath: options.key,
        certPath: options.cert,
      });
    }
  )
  .strict()
  .demandCommand(1).argv;
