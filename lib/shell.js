const { spawn } = require("node-pty");
const { brief, CONTROL_CHARACTERS } = require("./util");
const debug = require("debug");
const debugShell = debug("dashflow:shell");

function shell(cwd, command, on) {
  debugShell(`run shell command ${command} at ${cwd}`);

  let streamAlive = true;
  let exitCode = null;

  const stream = spawn("sh", ["-c", command], { cwd });

  stream.on("data", chunk => {
    const content = chunk.toString("utf-8");

    debugShell("shell data", command, brief(content));

    on("data", content);
  });

  stream.on("exit", (code, signal) => {
    streamAlive = false;
    exitCode = code;

    debugShell("exit", command, code, signal);

    on("exit", code);
  });

  return {
    stream,
    terminate: function terminate(onErr) {
      if (streamAlive) {
        try {
          // PID range hack
          // https://azimi.me/2014/12/31/kill-child_process-node-js.html
          process.kill(process.platform === "win32" ? stream.pid : -stream.pid);
        } catch (err) {
          debugShell("terminate error", err.message);

          if (onErr) {
            onErr(err);
          }
        }
      }
    },
    promise: new Promise(function(resolve, reject) {
      const intervalId = setInterval(function checkAlive() {
        debugShell("check alive");

        if (!streamAlive) {
          clearInterval(intervalId);

          if (exitCode === 0) {
            resolve();
          } else {
            reject(exitCode);
          }
        }
      }, 500);
    }),
    attach: function attach(parent) {
      return new Promise(function(resolve, reject) {
        function onStreamOut(chunk) {
          const content = chunk.toString("utf-8");

          parent.stdout.write(content);
        }

        function onUserInput(chunk) {
          if (chunk.equals(CONTROL_CHARACTERS.ETX)) {
            // ctrl+c
            onDetach();
          } else {
            stream.write(chunk);
          }
        }

        function onDetach() {
          stream.removeListener("data", onStreamOut);
          stream.removeListener("exit", onDetach);
          parent.stdin.removeListener("data", onUserInput);

          resolve();
        }

        if (streamAlive) {
          parent.stdin.on("data", onUserInput);
          stream.on("data", onStreamOut);
          stream.on("exit", onDetach);

          stream.resize(parent.stdout.columns, parent.stdout.rows);
        } else {
          reject(
            new Error(
              "Cannot attach to stream since the child process had quit"
            )
          );
        }
      });
    },
  };
}

module.exports = shell;
