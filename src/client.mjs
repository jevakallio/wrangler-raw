export default /* html*/ `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0, shrink-to-fit=no"
    />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <title>Wrangler</title>
  </head>
  <body>
    <div id="app"></div>
    <script>
      // Let's append all the messages we get into this DOM element
      const output = document.getElementById("app");

      // Helper function to add a new line to the DOM
      function add(text) {
        output.appendChild(document.createTextNode(text));
        output.appendChild(document.createElement("br"));
      }

      const url = new URL(window.location);
      const room = url.searchParams.get("room") ?? "default";

      const protocol = url.hostname === "localhost" || url.hostname === "0.0.0.0" || url.hostname === "127.0.0.1" ? "ws" : "wss";

      const server = protocol + "://" + url.host + "?room=" + room;
      const conn = new WebSocket(server);

      conn.addEventListener("message", (event) =>
        add("Message -> " + event.data)
      );

      conn.addEventListener("open", () => add("Connected to " + server));
    </script>
  </body>
</html>
`;
