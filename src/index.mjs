import html from "./client.mjs";
// Worker
export default {
  async fetch(request, env) {
    // serve html page
    if (request.headers.get("upgrade")?.toLowerCase() !== "websocket") {
      return new Response(html, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
        },
      });
    }

    const name = new URL(request.url).searchParams.get("room") || "default";
    const obj = env.COUNTER.get(env.COUNTER.idFromName(name));
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
    const sockets = [...this.state.getWebSockets()];
    const open = sockets.filter(
      (s) => s.readyState === WebSocket.READY_STATE_OPEN
    );

    const message = `${event} - sockets: ${sockets.length} total (${open.length} open)`;
    console.log(message);
    for (const socket of sockets) {
      socket.send(message);
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

  getConnections() {
    const sockets = [...this.state.getWebSockets()];
    const open = sockets.filter(
      (s) => s.readyState === WebSocket.READY_STATE_OPEN
    );

    return `${sockets.length} sockets (${open.length} open)`;
  }

  // Handle HTTP requests from clients.
  async fetch(request) {
    // Create the websocket pair for the client
    const { 0: clientWebSocket, 1: serverWebSocket } = new WebSocketPair();
    this.state.acceptWebSocket(serverWebSocket);

    this.pushEvent("webSocketConnect (fetch)");

    return new Response(null, { status: 101, webSocket: clientWebSocket });
  }
}
