const { init, add, subscribe } = require("./events");
const { createStream } = require("./stream");
const { createWorkflow } = require("./workflow");
const debug = require("debug");
const debugDaemon = debug("daemon");

function startDaemon(config) {
  debugDaemon("starting daemon with config", config);

  const app = {
    events: init(),
    config,
    streams: {},
    getStreamIds: function getStreamIds() {
      return Object.keys(this.config.streams);
    },
    getWorkflowIds: function getWorkflowIds() {
      return Object.keys(this.config.workflows);
    },
    restartStream: function restartStream(streamId) {
      const self = this;

      if (this.streams[streamId]) {
        this.streams[streamId].terminate();
      }

      this.streams[streamId] = createStream(
        streamId,
        config.streams[streamId],
        function onEvent(newEvent) {
          self.addEvent(`stream:${streamId}:${newEvent}`);
        }
      );
    },
    attachToStream: function attach(streamId, attachToProcess) {
      return this.streams[streamId].attach(attachToProcess);
    },
    writeToStream: function writeToStream(streamId, message) {
      this.streams[streamId].write(message);
    },
    addEvent: function addEvent(event) {
      return add(event, this.events);
    },
  };

  Object.keys(config.workflows).forEach(id => {
    const workflow = createWorkflow(
      id,
      config.workflows[id],
      config.commands,
      function onEvent(newEvent) {
        app.addEvent(`workflow:${id}:${newEvent}`);
      },
      function restartStream(streamId) {
        app.restartStream(streamId);
      }
    );

    subscribe(app.events, id, workflow);
  });

  app.addEvent("SYSTEM:started");

  Object.keys(config.streams).forEach(id => {
    app.streams[id] = createStream(id, config.streams[id], function onEvent(
      newEvent
    ) {
      app.addEvent(`stream:${id}:${newEvent}`);
    });
  });

  debugDaemon("snapshot after initialization", app);

  process.on("exit", () => {
    // recycle stream processes
    Object.values(app.streams).forEach(stream => {
      stream.terminate();
    });
  });

  return app;
}

module.exports = { startDaemon };
