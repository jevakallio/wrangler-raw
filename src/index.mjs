// Worker
export default {
  async fetch(request, env) {
    if (request.headers.get("upgrade")?.toLowerCase() !== "websocket") {
      return new Response("Please connect with WebSockets!!", { status: 404 });
    }

    const obj = env.COUNTER.get(env.COUNTER.idFromName("A"));
    return obj.fetch(request);
  },
};

// Durable Object
export class Counter {
  constructor(state, env) {
    this.state = state;
    this.pushEvent("Durable Object constructor");
  }

  async pushEvent(event) {
    console.log(event);

    // send the event to clients so we can verify the callbacks do run
    const sockets = this.state.getWebSockets();
    for (const socket of sockets) {
      socket.send(event);
    }
  }

  async webSocketClose(ws) {
    this.pushEvent("webSocketClose");
  }

  async webSocketError(ws) {
    this.pushEvent("webSocketError");
  }

  async webSocketMessage(ws, msg) {
    this.pushEvent("webSocketMessage: " + msg);
  }

  // Handle HTTP requests from clients.
  async fetch(request) {
    const url = new URL(request.url);
    const hibernate = url.searchParams.get("hibernate") === "true";

    // Create the websocket pair for the client
    const { 0: clientWebSocket, 1: serverWebSocket } = new WebSocketPair();

    if (hibernate) {
      this.state.acceptWebSocket(serverWebSocket);
    } else {
      serverWebSocket.addEventListener("message", (e) =>
        this.webSocketMessage(serverWebSocket, e.data)
      );

      serverWebSocket.addEventListener("close", () =>
        this.webSocketClose(serverWebSocket)
      );

      serverWebSocket.addEventListener("error", (e) =>
        this.webSocketError(serverWebSocket)
      );

      serverWebSocket.accept();
    }

    this.pushEvent(hibernate ? "hibernating" : "NOT hibernating");
    this.pushEvent("webSocketConnect (fetch)");

    return new Response(null, { status: 101, webSocket: clientWebSocket });
  }
}
