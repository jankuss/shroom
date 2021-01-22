import WebSocket from "ws";
import { createConnection } from "net";
import ByteBuffer from "bytebuffer";

import { createServer } from "https";
import { readFileSync } from "fs";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const frame = require("frame-stream");

export function runForwardingServer({
  wsPort,
  targetPort,
  debug = false,
  prependLengthPrefix = false,
  targetHost,
  keyPath,
  certPath
}: {
  wsPort: number;
  targetPort: number;
  debug?: boolean;
  targetHost?: string;
  prependLengthPrefix?: boolean;
  keyPath?: string,
  certPath?: string,
}) {
  let webSocketOptions: WebSocket.ServerOptions;
  if (keyPath && certPath) {
    webSocketOptions = {
      server: createServer({
        key: readFileSync(keyPath),
        cert: readFileSync(certPath)
      })
    };

    webSocketOptions.server?.listen(wsPort);
  } else {
    webSocketOptions = {
      port: wsPort
    };
  }

  const server = new WebSocket.Server(webSocketOptions);

  const targetHostStr =
    targetHost == null ? `:${targetPort}` : `${targetHost}:${targetPort}`;
  console.log(
    `${webSocketOptions.server ? 'Secure' : ''} WebSocket Server started on port ${wsPort}. Forwarding traffic to ${targetHostStr}.`
  );

  let idCounter = 0;

  server.on("connection", (ws) => {
    const id = ++idCounter;

    if (debug) console.log(`[${id}] Forwarding WebSocket Client connection`);

    // When a websocket client connects, create a socket to the emulator server
    const connection = createConnection({ port: targetPort, host: targetHost });

    // Pipe to the frame-stream decoder to handle length prefixed messages
    connection.pipe(frame.decode()).on("data", (buffer: Buffer) => {
      if (prependLengthPrefix) {
        const framedBuffer: any = buffer;

        const baseBuffer = new ByteBuffer();
        baseBuffer.writeInt(framedBuffer.frameLength);
        baseBuffer.append(buffer);

        ws.send(baseBuffer.flip().toBuffer());
      } else {
        ws.send(buffer);
      }

      if (debug) console.log(`[${id}] Server => Client:`, buffer);
    });

    // Forward close event from server to websocket client
    connection.on("close", () => {
      ws.close();
      if (debug) console.log(`[${id}] Server closed the connection`);
    });

    // Forward messages sent by the websocket client to the emulator server
    ws.on("message", (message) => {
      const buffer = message as Buffer;
      const data = new ByteBuffer();

      // Write an int to the payload with the size of the buffer we are sending
      data.writeInt(buffer.length);
      data.append(buffer);

      const sendBuffer = data.flip().toBuffer();
      connection.write(sendBuffer);

      if (debug) console.log(`[${id}] Client => Server:`, sendBuffer);
    });

    // Forward close event to the emulator server
    ws.on("close", () => {
      connection.end();
      if (debug) console.log(`[${id}] WebSocket closed the connection`);
    });
  });

  return {
    close() {
      server.close();
    },
  };
}
