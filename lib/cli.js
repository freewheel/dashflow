const boxen = require("boxen");
const chalk = require("chalk");
const path = require("path");
const fs = require("fs");
const { startDaemon } = require("./daemon");
const { serve } = require("./server");
const { createShell } = require("./interactive_shell");
const { parseMulti } = require("./config");
const { executeCommand } = require("./command");

const STARTING_PORT = 9527;

function normalizeConfig(configs) {
  return configs.map(file => path.resolve(".", file));
}

function checkExistence(configs) {
  configs.forEach(file => {
    const hasConfig = fs.existsSync(file);

    if (!hasConfig) {
      process.stderr.write(
        chalk.red(`Cannot find configuration file ${file}.\n`)
      );

      process.exit(1);
    }
  });
}

function printServerAddress(port) {
  const serverAddress = `http://localhost:${port}`;

  process.stdout.write(
    boxen(
      `${chalk.green("HTTP server is serving!")}` +
        "\n\n" +
        `Visit ${chalk.bold(serverAddress)} to view dashboards.`,
      { padding: 1, borderColor: "green" }
    ) + "\n\n"
  );
}

async function startOneOff(config, commands) {
  const supportedCommands = Object.keys(config.commands);
  const unknownCommands = commands.filter(
    command => !supportedCommands.includes(command)
  );

  if (unknownCommands.length > 0) {
    throw new Error(
      `some commands are not found in configuration: ${commands.join(", ")}`
    );
  }

  for (const command of commands) {
    // execute command
    try {
      await executeCommand(command, config.commands, (type, data) => {
        if (type === "data") {
          process.stdout.write(data);
        }
      });
    } catch (exitCode) {
      process.exit(exitCode);
    }
  }
}

function findPort() {
  return new Promise((resolve, reject) => {
    require("portfinder").getPort({ port: STARTING_PORT }, function(err, port) {
      if (err) {
        reject(err);
      } else {
        resolve(port);
      }
    });
  });
}

function defaultOnServerError(err) {
  process.stderr.write("Quit due to Web Server Error: " + err.message + "\n");

  process.exit(1);
}

async function start(
  configs,
  port = null,
  commands = [],
  onServerError = defaultOnServerError
) {
  checkExistence(configs);

  const configFiles = normalizeConfig(configs);

  const config = parseMulti(configFiles);

  if (commands.length > 0) {
    // one off mode
    await startOneOff(config, commands);
  } else {
    // daemon mode
    const app = startDaemon(config);
    // serve HTTP and websocket
    const finalPort = port || (await findPort());

    serve(app, finalPort, onServerError);
    // do not print for debug mode
    if (process.env.DEBUG) {
      process.stdout.write("Debugging, skipping interactive shell..\n");
    } else {
      printServerAddress(finalPort);
      createShell(app);
    }
  }
}

module.exports = { start };
