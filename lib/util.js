const BRIEF_LINE_LIMIT = 200;

function brief(event) {
  const eventWithoutLineBreak = event.replace(/\n/g, "\\n");

  if (eventWithoutLineBreak.length > BRIEF_LINE_LIMIT) {
    return eventWithoutLineBreak.substring(0, BRIEF_LINE_LIMIT) + "...";
  } else {
    return eventWithoutLineBreak;
  }
}

function partition(event) {
  if (event === undefined) {
    return [undefined, undefined];
  }

  const posOfFirstColon = event.indexOf(":");

  if (posOfFirstColon === -1) {
    return [event, undefined];
  }

  const before = event.substring(0, posOfFirstColon);
  const after = event.substring(posOfFirstColon + 1);

  return [before, after];
}

// regex from https://github.com/chalk/ansi-regex
const ANSI_REGEX = (() => {
  const pattern = [
    "[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)",
    "(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PRZcf-ntqry=><~]))",
  ].join("|");

  return new RegExp(pattern, "g");
})();

function stripAnsi(input) {
  return input.replace(ANSI_REGEX, "");
}

const CONTROL_CHARACTERS = {
  ETX: Buffer.from([3]),
};

module.exports = { brief, partition, stripAnsi, CONTROL_CHARACTERS };
