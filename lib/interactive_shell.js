const chalk = require("chalk");
const vorpal = require("vorpal");
const ansiEscapes = require("ansi-escapes");
const { smartUnformat } = require("./formatter");
const { executeCommand } = require("./command");

function guardStream(app, handle) {
  return (args, callback) => {
    const { streamId } = args;
    const stream = app.streams[streamId];

    if (!stream) {
      process.stdout.write(chalk.red(`Cannot find stream "${streamId}"\n`));

      callback();
    } else {
      handle(streamId, callback);
    }
  };
}

async function withIOStack(callback) {
  const sigIntListeners = process.listeners("SIGINT");

  sigIntListeners.forEach(listener => {
    process.removeListener("SIGINT", listener);
  });

  const dataListeners = process.stdin.listeners("data");

  dataListeners.forEach(listener => {
    process.stdin.removeListener("data", listener);
  });

  process.stdout.write(ansiEscapes.clearScreen);

  process.stdin.resume();

  try {
    await callback();

    process.stdout.write(ansiEscapes.clearScreen);
  } catch (err) {
    process.stderr.write(err.message + "\n");
    process.stderr.write(err.stack + "\n");
  }

  sigIntListeners.forEach(listener => {
    process.on("SIGINT", listener);
  });

  dataListeners.forEach(listener => {
    process.stdin.on("data", listener);
  });
}

function createShell(app) {
  const shell = vorpal();

  shell.delimiter("dashflow-shell~$");

  shell
    .command("events [pattern]")
    .option("-l, --limit", "Show only specified number of records.")
    .description("Dump events")
    .action(function(args, done) {
      const columnify = require("columnify");
      const { scan } = require("./events");
      const { partition, stripAnsi } = require("./util");
      const pattern = new RegExp(args.pattern || ".*");
      const limit = parseInt((args.options && args.options.limit) || "100");

      const matchingEvents = scan(pattern, limit, app.events).reverse();
      const total = matchingEvents.length;

      this.log(
        columnify(
          matchingEvents.map(({ time, event }) => {
            const [type, typeRemain] = partition(stripAnsi(event));

            const [id, idRemain] = partition(typeRemain);

            const [provider, providerRemain] = partition(idRemain);

            const [meta1, meta1Remain] = partition(providerRemain);

            const [meta2, meta2Remain] = partition(meta1Remain);

            const [meta3, meta4] = partition(meta2Remain);

            return {
              time,
              type,
              id,
              provider,
              meta1,
              meta2,
              meta3,
              meta4,
            };
          })
        )
      );

      if (limit < total) {
        this.log(
          `\nShowing last ${limit} of total ${total} events. Use --limit option if you would like to see more.`
        );
      }

      done();
    });

  shell
    .command("emit <event>")
    .description("Emit a new event")
    .action(function(args, done) {
      app.addEvent(args.event);

      done();
    });

  shell
    .command("run <command>")
    .description("Run a command")
    .autocomplete(Object.keys(app.config.commands))
    .action(function(args, done) {
      const supportedCommands = Object.keys(app.config.commands);
      const command = args.command;

      if (supportedCommands.includes(command)) {
        executeCommand(
          command,
          app.config.commands,
          (type, data) => {
            if (type === "data") {
              process.stdout.write(data);
            }
          },
          true
        )
          .then(() => {
            done();
          })
          .catch(() => {
            // swallow errors
            done();
          });
      } else {
        process.stderr.write(
          `unknown command ${command}, supported commands are:\n  - ${supportedCommands.join(
            "\n  - "
          )}\n`
        );
        done();
      }
    });

  shell
    .command("tail <streamOrWorkflowId>")
    .description("Tail to a stream or workflow")
    .alias("t")
    .autocomplete(app.getStreamIds().concat(app.getWorkflowIds()))
    .action(function(args, done) {
      const LINES_TO_RECALL = 100;
      const { scan } = require("./events");

      const eventsRecalled = scan(
        new RegExp(`(stream|workflow):${args.streamOrWorkflowId}:`),
        LINES_TO_RECALL,
        app.events
      );

      eventsRecalled.reverse().forEach(({ event }) => {
        const readable = smartUnformat(event);

        if (readable) {
          process.stdout.write(readable);
        }
      });

      process.stdout.write("\n");

      done();
    });

  shell
    .command("attach <streamId>")
    .description("Attach to a stream")
    .alias("a")
    .autocomplete(app.getStreamIds())
    .action(
      guardStream(app, async (streamId, done) => {
        try {
          await withIOStack(() => {
            const LINES_TO_RECALL = 100;
            const { scan } = require("./events");

            const eventsRecalled = scan(
              new RegExp(`^stream:${streamId}:`),
              LINES_TO_RECALL,
              app.events
            );

            eventsRecalled.reverse().forEach(({ event }) => {
              const readable = smartUnformat(event);

              if (readable) {
                process.stdout.write(readable);
              }
            });

            return app.attachToStream(streamId, process);
          });

          done();
        } catch (error) {
          process.stdout.write(chalk.red(error.message) + "\n");

          done();
        }
      })
    );

  shell
    .command("restart <streamId>")
    .description("Restart a stream")
    .autocomplete(app.getStreamIds())
    .action(
      guardStream(app, (streamId, done) => {
        app.restartStream(streamId);

        done();
      })
    );

  shell
    .command("stats")
    .description("Print stats information")
    .action(function(args, done) {
      const columnify = require("columnify");
      const { length } = require("./events");

      this.log(
        columnify({
          "Number of Events": length(app.events),
          "Number of Streams": Object.keys(app.streams).length,
        })
      );

      done();
    });

  shell
    .command("config")
    .description("Print config information")
    .action(function(args, done) {
      const yaml = require("js-yaml");

      this.log(yaml.safeDump(app.config, { flowLevel: 2 }));

      done();
    });

  shell
    .command("env")
    .description("Print environment variables")
    .action(function(args, done) {
      const columnify = require("columnify");

      this.log(columnify(process.env));

      done();
    });

  process.stdout.write(
    `Besides using browser the alternative way is using dashflow shell.\n` +
      `Type ${chalk.bold("help")} in the shell to list available commands.\n\n`
  );

  shell.show();
}

module.exports = { createShell };
