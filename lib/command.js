const shell = require("./shell");
const debug = require("debug");
const debugCommand = commandId => debug(`command:${commandId}`);

const PROVIDERS = {
  shell: function execShell(id, { cwd, cmd }, _, onEvent, attach) {
    debugCommand("run shell", id, cmd, cwd);

    const { promise, attachOneOff } = shell(cwd, cmd, onEvent);

    if (attach) {
      attachOneOff(process);
    }

    return promise;
  },
  serial: async function execSerial(
    id,
    toExecuteCommands,
    commands,
    onEvent,
    attach
  ) {
    debugCommand("run serial", id);

    for (const command of toExecuteCommands) {
      await executeCommand(command, commands, onEvent, attach);
    }
  },
  parallel: function execParallel(id, toExecuteCommands, commands, onEvent) {
    debugCommand("run parallel", id);

    // parallel doesn't support attach
    return Promise.all(
      toExecuteCommands.map(command =>
        executeCommand(command, commands, onEvent, false)
      )
    );
  },
};

function executeCommand(id, commands, onEvent, attach = false) {
  const spec = commands[id];
  const types = Object.keys(spec);

  if (types.length !== 1) {
    throw new Error(`Expect to have one single type for command ${id}`);
  }

  const type = types[0];

  if (PROVIDERS[type]) {
    return PROVIDERS[type](id, spec[type], commands, onEvent, attach);
  } else {
    throw new Error(`Unsupported type ${type} for command ${id}`);
  }
}

module.exports = {
  executeCommand,
};
