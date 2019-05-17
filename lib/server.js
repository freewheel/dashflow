const http = require("http");
const path = require("path");
const handler = require("serve-handler");
const debug = require("debug");
const socketIO = require("socket.io");
const { subscribe, unsubscribe, backwardsPage } = require("./events");
const { smartUnformat } = require("./formatter");
const debugServer = debug("server");

class PortUnavailableError extends Error {}

const CATCHUP_BATCH_SIZE = 10000;

function toBrowserEvent(event) {
  return {
    id: event.id,
    t: event.time,
    e: event.event,
    h: smartUnformat(event.event),
  };
}

function serve(app, port, onError) {
  const server = http.createServer((req, res) => {
    debugServer(req);

    handler(req, res, {
      public: path.relative(
        process.cwd(),
        path.resolve(__dirname, "..", "web")
      ),
      directoryListing: false,
    });
  });

  let seq = 0;

  const io = socketIO(server);

  io.on("connection", function(socket) {
    debugServer("a user connected");

    socket.on("get_dashboards_config", function() {
      socket.emit("get_dashboards_config", app.config.dashboards);
    });

    socket.on("catchup", function() {
      let cursor = app.events.tail;

      const catchup = setInterval(() => {
        const page = backwardsPage(cursor, CATCHUP_BATCH_SIZE);
        cursor = page[0];
        const batch = page[1];

        if (batch.length > 0) {
          socket.emit("catchup_batch", batch.map(toBrowserEvent));

          debugServer("catch");
        } else {
          clearInterval(catchup);

          socket.emit("catchup_done");

          debugServer("catch done");
        }
      }, 1000);
    });

    socket.on("delta", function() {
      let eventSubscriberId = `socket-agent-${seq++}`;

      subscribe(app.events, eventSubscriberId, (event, time, id) => {
        socket.emit("delta", toBrowserEvent({ event, time, id }));

        debugServer("delta");
      });

      socket.on("disconnect", function() {
        unsubscribe(app.events, eventSubscriberId);

        debugServer("user disconnected");
      });
    });
  });

  server.on("error", err => {
    if (err.code === "EADDRINUSE") {
      onError(
        new PortUnavailableError(
          `port ${port} is not available, please quit the other running job or specify a different port`
        )
      );
    } else {
      onError(err);
    }
  });

  server.listen(port);
}

module.exports = {
  serve,
};
