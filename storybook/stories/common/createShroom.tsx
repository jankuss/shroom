import * as PIXI from "pixi.js";
import { Shroom } from "@jankuss/shroom";
import { useRef } from "react";
import React from "react";

type CleanupFn = () => void;
type CallbackOptions = {
  application: PIXI.Application;
  shroom: Shroom;
  container: HTMLDivElement;
};

export function createShroom(
  cb: (options: CallbackOptions) => CleanupFn | void
) {
  const App = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    React.useEffect(() => {
      const element = canvasRef.current;
      const container = containerRef.current;
      if (element == null) return;
      if (container == null) return;

      const application = new PIXI.Application({
        view: element,
        width: 1400,
        height: 850,
      });
      const shroom = Shroom.create({
        resourcePath: "./resources",
        application: application,
        configuration: {
          placeholder: PIXI.Texture.from("./images/placeholder.png"),
        },
      });

      const cleanup = cb({ application, shroom, container });

      return () => {
        cleanup && cleanup();

        application.destroy();
      };
    }, []);

    return (
      <div ref={containerRef}>
        <canvas ref={canvasRef} />
      </div>
    );
  };

  return <App />;
}
