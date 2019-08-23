/* eslint-env browser */

// regex from https://github.com/chalk/ansi-regex
const ANSI_REGEX = (() => {
  const pattern = [
    "[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:[a-zA-Z\\d]*(?:;[a-zA-Z\\d]*)*)?\\u0007)",
    "(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PRZcf-ntqry=><~]))",
  ].join("|");

  return new RegExp(pattern, "g");
})();

function stripAnsi(input) {
  return input.replace(ANSI_REGEX, "");
}

function trimLineBreaks(input) {
  return input.replace(/^[\n]+|[\n]+$/g, "");
}

function normalizeLineBreaks(input) {
  return input.replace(/\r\n/g, "\n");
}

const POSITION_ALIASES = {
  fullscreen: { top: "0", left: "0", width: "100%", height: "100%" },
  "quadrant/top-left": { top: "0", left: "0", width: "50%", height: "50%" },
  "quadrant/2": { top: "0", left: "0", width: "50%", height: "50%" },
  "quadrant/top-right": { top: "0", left: "50%", width: "50%", height: "50%" },
  "quadrant/1": { top: "0", left: "50%", width: "50%", height: "50%" },
  "quadrant/bottom-left": {
    top: "50%",
    left: "0",
    width: "50%",
    height: "50%",
  },
  "quadrant/3": { top: "50%", left: "0", width: "50%", height: "50%" },
  "quadrant/bottom-right": {
    top: "50%",
    left: "50%",
    width: "50%",
    height: "50%",
  },
  "quadrant/4": { top: "50%", left: "50%", width: "50%", height: "50%" },
  "quadrant/top": { top: "0", left: "0", width: "100%", height: "50%" },
  "quadrant/bottom": { top: "50%", left: "0", width: "100%", height: "50%" },
  "quadrant/left": { top: "0", left: "0", width: "50%", height: "100%" },
  "quadrant/right": { top: "0", left: "50%", width: "50%", height: "100%" },
};

function positionSpecToStyle(spec) {
  if (POSITION_ALIASES[spec]) {
    return POSITION_ALIASES[spec];
  }

  function fromPercent(s) {
    if (s === "0") {
      return 0;
    } else {
      return parseInt(s.substring(0, s.length - 1), 10);
    }
  }

  function toPercent(i) {
    if (i === 0) {
      return 0;
    } else {
      return i + "%";
    }
  }

  const [x1, y1, x2, y2] = spec
    .split(" ")
    .filter(s => s.length > 0)
    .map(fromPercent);

  return {
    top: toPercent(y1),
    left: toPercent(x1),
    width: toPercent(x2 - x1),
    height: toPercent(y2 - y1),
  };
}

function throttleFactory(wait) {
  let queue = [];

  setInterval(() => {
    const callback = queue.pop();

    if (callback instanceof Function) {
      callback();
    }
  }, wait);

  return function(callback) {
    if (queue.length === 0) {
      queue.push(callback);
    }
  };
}

export const Utils = {
  stripAnsi,
  trimLineBreaks,
  normalizeLineBreaks,
  positionSpecToStyle,
  throttleFactory,
};
