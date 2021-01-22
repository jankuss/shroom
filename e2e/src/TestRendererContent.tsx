import React, { useRef, useState } from "react";
import * as PIXI from "pixi.js";
import styled from "styled-components";
import { Shroom } from "@jankuss/shroom";

import { TestMap } from "./TestMap";
import { TestRenderer } from "./TestRenderer";
import { tests } from "./tests";

const shared = Shroom.createShared({ resourcePath: "./resources" });

export function TestRendererContent({ keys }: { keys: string[] }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [activeRenderer, setActiveRenderer] = useState<
    | {
        render: TestRenderer;
        index: number;
      }
    | undefined
  >();

  React.useLayoutEffect(() => {
    const canvas = ref.current;
    const parent = contentRef.current;
    if (canvas == null) return;
    if (parent == null) return;

    const render = getTestFromKeys(keys);

    if (render != null) {
      setActiveRenderer((prev) => {
        return { render, index: (prev?.index ?? 0) + 1 };
      });
    }
  }, [keys]);

  React.useLayoutEffect(() => {
    const canvas = ref.current;
    const parent = contentRef.current;
    if (canvas == null) return;
    if (parent == null) return;
    if (activeRenderer == null) return;

    console.log("CREATE APPLICATION", keys);
    const application = new PIXI.Application({
      view: canvas,
      resizeTo: parent,
    });
    const shroom = shared.for(application);

    const cleanup = activeRenderer.render({ shroom, application });

    return () => {
      console.log("DESTROY APPLICATION", keys);
      cleanup && cleanup();
      application.destroy();
    };
  }, [activeRenderer]);

  return (
    <Content ref={contentRef}>
      <canvas ref={ref} key={activeRenderer?.index} />
    </Content>
  );
}

function getTestFromKeys(keys: string[]) {
  let object: TestRenderer | TestMap | undefined = tests;

  keys.forEach((key) => {
    if (typeof object === "object") {
      const newObject = object[key];

      object = newObject;
    }
  });

  if (typeof object === "function") {
    return object as TestRenderer;
  }
}

const Content = styled.div`
  overflow: hidden;
`;
