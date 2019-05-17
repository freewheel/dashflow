const shell = require("./shell");
const debug = require("debug");
const debugCommand = commandId => debug(`command:${commandId}`);

const PROVIDERS = {
  shell: function execShell(id, { cwd, cmd }, _, onEvent) {
    debugCommand("run shell", id, cmd, cwd);

    const { promise } = shell(cwd, cmd, onEvent);

    return promise;
  },
  serial: async function execSerial(id, toExecuteCommands, commands, onEvent) {
    debugCommand("run serial", id);

    for (const command of toExecuteCommands) {
      await executeCommand(command, commands, onEvent);
    }
  },
  parallel: function execParallel(id, toExecuteCommands, commands, onEvent) {
    debugCommand("run parallel", id);

    return Promise.all(
      toExecuteCommands.map(command =>
        executeCommand(command, commands, onEvent)
      )
    );
  },
};

async function executeCommand(id, commands, onEvent) {
  const spec = commands[id];
  const types = Object.keys(spec);

  if (types.length !== 1) {
    throw new Error(`Expect to have one single type for command ${id}`);
  }

  const type = types[0];

  if (PROVIDERS[type]) {
    return PROVIDERS[type](id, spec[type], commands, onEvent);
  } else {
    throw new Error(`Unsupported type ${type} for command ${id}`);
  }
}

module.exports = {
  executeCommand,
};
