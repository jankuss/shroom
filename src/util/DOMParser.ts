import { JSDOM } from "jsdom";

export let DOMParser: typeof window.DOMParser;

if (typeof window === "undefined") {
  const jsdom = new JSDOM();
  DOMParser = jsdom.window.DOMParser;
} else {
  DOMParser = window.DOMParser;
}
