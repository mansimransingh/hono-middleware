// src/index.ts
import { WebSocketServer } from "ws";

// src/events.ts
var CloseEvent = globalThis.CloseEvent ?? class extends Event {
  #eventInitDict;
  constructor(type, eventInitDict = {}) {
    super(type, eventInitDict);
    this.#eventInitDict = eventInitDict;
  }
  get wasClean() {
    return this.#eventInitDict.wasClean ?? false;
  }
  get code() {
    return this.#eventInitDict.code ?? 0;
  }
  get reason() {
    return this.#eventInitDict.reason ?? "";
  }
};

// src/index.ts
var createNodeWebSocket = (init) => {
  const wss = new WebSocketServer({ noServer: true });
  const waiterMap = /* @__PURE__ */ new Map();
  wss.on("connection", (ws, request) => {
    const waiter = waiterMap.get(request);
    if (waiter) {
      waiter.resolve(ws);
      waiterMap.delete(request);
    }
  });
  const nodeUpgradeWebSocket = (request, response) => {
    return new Promise((resolve) => {
      waiterMap.set(request, { resolve, response });
    });
  };
  return {
    injectWebSocket(server) {
      server.on("upgrade", async (request, socket, head) => {
        const url = new URL(request.url ?? "/", init.baseUrl ?? "http://localhost");
        const headers = new Headers();
        for (const key in request.headers) {
          const value = request.headers[key];
          if (!value) {
            continue;
          }
          headers.append(key, Array.isArray(value) ? value[0] : value);
        }
        const response = await init.app.request(
          url,
          { headers },
          { incoming: request, outgoing: void 0 }
        );
        const waiter = waiterMap.get(request);
        if (!waiter || waiter.response !== response) {
          socket.end(
            "HTTP/1.1 400 Bad Request\r\nConnection: close\r\nContent-Length: 0\r\n\r\n"
          );
          waiterMap.delete(request);
          return;
        }
        wss.handleUpgrade(request, socket, head, (ws) => {
          wss.emit("connection", ws, request);
        });
      });
    },
    upgradeWebSocket: (createEvents) => async function upgradeWebSocket(c, next) {
      if (c.req.header("upgrade")?.toLowerCase() !== "websocket") {
        await next();
        return;
      }
      const response = new Response();
      (async () => {
        const ws = await nodeUpgradeWebSocket(c.env.incoming, response);
        const events = await createEvents(c);
        const ctx = {
          binaryType: "arraybuffer",
          close(code, reason) {
            ws.close(code, reason);
          },
          protocol: ws.protocol,
          raw: ws,
          get readyState() {
            return ws.readyState;
          },
          send(source, opts) {
            ws.send(source, {
              compress: opts?.compress
            });
          },
          url: new URL(c.req.url)
        };
        events.onOpen?.(new Event("open"), ctx);
        ws.on("message", (data, isBinary) => {
          const datas = Array.isArray(data) ? data : [data];
          for (const data2 of datas) {
            events.onMessage?.(
              new MessageEvent("message", {
                data: isBinary ? data2 : data2.toString("utf-8")
              }),
              ctx
            );
          }
        });
        ws.on("close", () => {
          events.onClose?.(new CloseEvent("close"), ctx);
        });
        ws.on("error", (error) => {
          events.onError?.(
            new ErrorEvent("error", {
              error
            }),
            ctx
          );
        });
      })();
      return response;
    }
  };
};
export {
  createNodeWebSocket
};
