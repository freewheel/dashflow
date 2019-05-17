const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

function readYAML(path) {
  const content = fs.readFileSync(path, "utf8");

  return yaml.safeLoad(content);
}

function normalizeCommands(commands, cwd) {
  if (commands) {
    for (const command in commands) {
      const spec = commands[command];

      if (typeof spec === "string") {
        commands[command] = {
          shell: {
            cmd: spec,
            cwd,
          },
        };
      } else {
        if (spec.shell) {
          spec.shell = {
            cmd: spec.shell.cmd,
            cwd: path.resolve(cwd, spec.shell.cwd || "."),
          };
        }
      }
    }

    return commands;
  } else {
    return {};
  }
}

function normalizeStreams(streams, cwd) {
  if (streams) {
    for (const stream in streams) {
      const spec = streams[stream];

      if (typeof spec === "string") {
        streams[stream] = {
          shell: {
            cmd: spec,
            cwd,
          },
        };
      } else {
        if (spec.shell) {
          streams[stream] = {
            shell: {
              cmd: spec.shell.cmd,
              cwd: path.resolve(cwd, spec.shell.cwd || "."),
            },
          };
        } else if (spec.watch) {
          streams[stream] = {
            watch: {
              glob: spec.watch.glob || "**/*.js",
              cwd: path.resolve(cwd, spec.watch.cwd || "."),
            },
          };
        }
      }
    }

    return streams;
  } else {
    return {};
  }
}

function normalizeWorkflows(workflows) {
  return workflows || {};
}

function normalizeDashboards(dashboards) {
  return dashboards || {};
}

function parse(configFilePath) {
  const cwd = path.dirname(configFilePath);
  const config = readYAML(configFilePath);

  config.commands = normalizeCommands(config.commands, cwd);
  config.streams = normalizeStreams(config.streams, cwd);
  config.workflows = normalizeWorkflows(config.workflows);
  config.dashboards = normalizeDashboards(config.dashboards);

  return config;
}

function merge(config1, config2) {
  return {
    commands: Object.assign({}, config1.commands, config2.commands),
    streams: Object.assign({}, config1.streams, config2.streams),
    workflows: Object.assign({}, config1.workflows, config2.workflows),
    dashboards: Object.assign({}, config1.dashboards, config2.dashboards),
  };
}

function parseMulti(arrayOfConfigFilePaths) {
  return arrayOfConfigFilePaths.reduce((acc, configFilePath) => {
    return merge(acc, parse(configFilePath));
  }, {});
}

module.exports = {
  parse,
  parseMulti,
};
