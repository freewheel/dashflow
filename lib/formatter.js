function substringAfter(string, keyword) {
  return string.substring(string.indexOf(keyword) + keyword.length);
}

const shellFormatter = {
  format: function format(command, device, content) {
    return `shell:${command}:${device}:${content}`;
  },
  unformat: function unformat(event) {
    // possibleDevices are ['stdout', 'stderr', 'state']
    // but state are invisible to human

    if (event.indexOf(":stdout:") !== -1) {
      return substringAfter(event, ":stdout:");
    } else if (event.indexOf(":stderr:") !== -1) {
      return substringAfter(event, ":stderr:");
    } else {
      return undefined;
    }
  },
};

const watchFormatter = {
  format: function format(event, path) {
    return `watch:${event}:${path}`;
  },
  unformat: function unformat(event) {
    return substringAfter(event, "watch:");
  },
};

const restartFormatter = {
  format: function format(streamId) {
    return `restart:${streamId}`;
  },
  unformat: function unformat(event) {
    return substringAfter(event, "restart:");
  },
};

const commandFormatter = {
  format: function format(name, device, content) {
    return `command:${name}:${device}:${content}`;
  },
  unformat: function unformat(event) {
    // possibleDevices are ['stdout', 'state']
    // but state are invisible to human

    if (event.indexOf(":stdout:") !== -1) {
      return substringAfter(event, ":stdout:");
    } else {
      return undefined;
    }
  },
};

function smartUnformat(event) {
  if (event.indexOf("shell:") !== -1) {
    return shellFormatter.unformat(event);
  } else if (event.indexOf("watch:") !== -1) {
    return watchFormatter.unformat(event);
  } else if (event.indexOf("restart:") !== -1) {
    return restartFormatter.unformat(event);
  } else if (event.indexOf("command:") !== -1) {
    return commandFormatter.unformat(event);
  } else {
    // do not know how to unformat
    // return as is
    return event;
  }
}

module.exports = {
  shellFormatter,
  watchFormatter,
  restartFormatter,
  commandFormatter,
  smartUnformat,
};
