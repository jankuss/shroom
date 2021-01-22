import * as PIXI from "pixi.js";

import { Shroom } from "@jankuss/shroom";

export type TestRendererCleanup = () => void;

export type TestRenderer = (options: {
  shroom: Shroom;
  application: PIXI.Application;
}) => TestRendererCleanup | undefined | void;
