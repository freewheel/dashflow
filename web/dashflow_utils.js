/* eslint-env browser */
(function utils() {
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

  function positionSpecToStyle(spec) {
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

  const Utils = {
    stripAnsi,
    trimLineBreaks,
    normalizeLineBreaks,
    positionSpecToStyle,
    throttleFactory,
  };

  window.Utils = Utils;
})();
