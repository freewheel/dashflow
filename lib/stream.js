const chokidar = require("chokidar");
const { watchFormatter } = require("./formatter");
const { shellFormatter } = require("./formatter");
const shell = require("./shell");
const debug = require("debug");
const debugStream = streamId => debug(`stream:${streamId}`);

const PROVIDERS = {
  watch: function execWatch(id, { cwd, glob }, onEvent) {
    debugStream(id)("run watch", glob, cwd);

    let watcherAlive = true;
    const watcher = chokidar
      .watch(glob, {
        cwd,
        atomic: true,
        ignoreInitial: true,
      })
      .on("all", (event, path) => {
        debugStream(id)("watch", event, path);

        onEvent(watchFormatter.format(event, path));
      });

    return {
      promise: new Promise(function(resolve) {
        const intervalId = setInterval(function checkAlive() {
          debugStream(id)("watch check alive");

          if (!watcherAlive) {
            clearInterval(intervalId);

            resolve();
          }
        }, 500);
      }),
      terminate: function terminate() {
        watcher.close();
        watcherAlive = false;
      },
      attach: function attach() {
        return new Promise(function(resolve, reject) {
          reject(new Error("Cannot attach to a watch stream"));
        });
      },
    };
  },
  shell: function execShell(id, { cwd, cmd }, onEvent) {
    // state can be used to detect that a shell starts to run
    onEvent(shellFormatter.format(cmd, "state", "started"));

    const { promise, terminate, attach } = shell(cwd, cmd, (type, data) => {
      if (type === "data") {
        onEvent(shellFormatter.format(cmd, "stdout", data));
      } else if (type === "exit") {
        onEvent(shellFormatter.format(cmd, "state", `exited with ${data}`));
      }
    });

    promise.catch(() => {
      // swallow exit error since we had it in event queue already
    });

    return { promise, terminate, attach };
  },
};

// each stream running in a child process
// if the child process crashed
// output errors but keeps main process running
function createStream(id, spec, onEvent) {
  const types = Object.keys(spec);

  if (types.length !== 1) {
    throw new Error(`Expect to have one single type for stream ${id}`);
  }

  const type = types[0];

  if (PROVIDERS[type]) {
    return PROVIDERS[type](id, spec[type], onEvent);
  } else {
    throw new Error(`Unsupported type ${type} for stream ${id}`);
  }
}

module.exports = {
  createStream,
};
