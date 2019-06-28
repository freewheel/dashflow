const { brief } = require("./util");
const { restartFormatter, commandFormatter } = require("./formatter");
const { executeCommand } = require("./command");
const debug = require("debug");
const debugWorkflow = workflowId => debug(`workflow:${workflowId}`);

const PROVIDERS = {
  command: function execCommand(id, commandName, commands, onEvent) {
    debugWorkflow(id)("run command", commandName);

    onEvent(commandFormatter.format(commandName, "state", "started"));

    return executeCommand(
      commandName,
      commands,
      (type, data) => {
        if (type === "data") {
          onEvent(commandFormatter.format(commandName, "stdout", data));
        } else if (type === "exit") {
          onEvent(
            commandFormatter.format(commandName, "state", `exited with ${data}`)
          );
        }
      },
      false
    );
  },
  restart: function execRestart(
    id,
    streamId,
    commands,
    onEvent,
    restartStream
  ) {
    return new Promise(function(resolve) {
      debugWorkflow(id)("run restart", streamId);

      restartStream(streamId);

      onEvent(restartFormatter.format(streamId));

      resolve();
    });
  },
  wait: function execWait(id, timeInMs) {
    debugWorkflow(id)("start wait", `${timeInMs}ms`);

    return new Promise(function(resolve) {
      setTimeout(() => {
        debugWorkflow(id)("done wait", `${timeInMs}ms`);

        resolve();
      }, timeInMs);
    });
  },
  parallel: function execParallel(
    id,
    subTasks,
    commands,
    onEvent,
    restartStream
  ) {
    return Promise.all(
      subTasks.map(task => {
        const type = Object.keys(task)[0];
        const spec = task[type];

        return executeTask(id, type, spec, commands, onEvent, restartStream);
      })
    );
  },
  serial: async function execSerial(
    id,
    subTasks,
    commands,
    onEvent,
    restartStream
  ) {
    for (const task of subTasks) {
      const type = Object.keys(task)[0];
      const spec = task[type];

      await executeTask(id, type, spec, commands, onEvent, restartStream);
    }
  },
};

function executeTask(id, type, spec, commands, onEvent, restartStream) {
  return PROVIDERS[type](id, spec, commands, onEvent, restartStream);
}

function createWorkflow(id, spec, commands, onEvent, restartStream) {
  const match = spec.match;

  const types = Object.keys(spec);

  if (types.length !== 2) {
    throw new Error(`Expect to have one single type for workflow ${id}`);
  }

  const type = types[0] === "match" ? types[1] : types[0];

  if (!PROVIDERS[type]) {
    throw new Error(`Unsupported type ${type} for workflow ${id}`);
  }

  debugWorkflow(id)("match", match, "type", type);

  const matchPattern = new RegExp(match);

  return event => {
    debugWorkflow(id)("received an event", event, match);

    if (matchPattern.test(event)) {
      debugWorkflow(id)("found a match", brief(event));

      // const filename = R.last(event.split(":"));

      setTimeout(() => {
        executeTask(
          id,
          type,
          spec[type],
          commands,
          onEvent,
          restartStream
        ).catch(() => {
          // do nothing for workflow errors
        });
      }, 0);
    }
  };
}

module.exports = {
  createWorkflow,
};
