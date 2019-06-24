/* eslint-env browser */
// this page is for demo site
// new events will be generated every a few seconds
// so the site will look dynamic
(function connect() {
  function connectToDemo(store) {
    const dashboards = {
      "all-in-one": [
        {
          log: {
            position: "0 0 100% 50%",
            title: "Build",
            filter: "command:build:.*",
            gauge: {
              filter: "command:build:state:.*",
              scan: {
                when: [
                  {
                    pattern: "started",
                    text: "Running",
                    level: "warning",
                  },
                  {
                    pattern: "exited with 0",
                    text: "Passed",
                    level: "success",
                  },
                  {
                    pattern: "exited with",
                    text: "Failed",
                    level: "error",
                  },
                ],
                default: {
                  text: "Unknown",
                },
              },
            },
          },
        },
        {
          log: {
            position: "0 50% 50% 100%",
            title: "Lint",
            filter: "command:lint:.*",
            gauge: {
              filter: "command:lint:state:.*",
              scan: {
                when: [
                  {
                    pattern: "started",
                    text: "Running",
                    level: "warning",
                  },
                  {
                    pattern: "exited with 0",
                    text: "Passed",
                    level: "success",
                  },
                  {
                    pattern: "exited with",
                    text: "Failed",
                    level: "error",
                  },
                ],
                default: {
                  text: "Unknown",
                },
              },
            },
          },
        },
        {
          log: {
            position: "50% 50% 100% 100%",
            title: "Test",
            filter: "command:test:.*",
            gauge: {
              filter: "command:test:state:.*",
              scan: {
                when: [
                  {
                    pattern: "started",
                    text: "Running",
                    level: "warning",
                  },
                  {
                    pattern: "exited with 0",
                    text: "Passed",
                    level: "success",
                  },
                  {
                    pattern: "exited with",
                    text: "Failed",
                    level: "error",
                  },
                ],
                default: {
                  text: "Unknown",
                },
              },
            },
          },
        },
      ],
      "lint-only": [
        {
          log: {
            position: "0 0 100% 100%",
            title: "Lint",
            filter: "command:lint:.*",
            gauge: {
              filter: "command:lint:state:.*",
              scan: {
                when: [
                  {
                    pattern: "started",
                    text: "Running",
                    level: "warning",
                  },
                  {
                    pattern: "exited with 0",
                    text: "Passed",
                    level: "success",
                  },
                  {
                    pattern: "exited with",
                    text: "Failed",
                    level: "error",
                  },
                ],
                default: {
                  text: "Unknown",
                },
              },
            },
          },
        },
      ],
      "test-only": [
        {
          log: {
            position: "0 0 100% 100%",
            title: "Test",
            filter: "command:test:.*",
            gauge: {
              filter: "command:test:state:.*",
              scan: {
                when: [
                  {
                    pattern: "started",
                    text: "Running",
                    level: "warning",
                  },
                  {
                    pattern: "exited with 0",
                    text: "Passed",
                    level: "success",
                  },
                  {
                    pattern: "exited with",
                    text: "Failed",
                    level: "error",
                  },
                ],
                default: {
                  text: "Unknown",
                },
              },
            },
          },
        },
      ],
    };

    try {
      store.clearErrorMessages();
      store.updateDashboards(dashboards);
      store.updateCurrentDashboardTitle(null);
    } catch (err) {
      store.addErrorMessage(err.message);
    }

    setInterval(function() {
      // append a random event every 2 seconds
      store.appendEvents(generateRandonEvents());
    }, 1500);
  }

  let globalEventId = 1;

  function getRandomChoice(choices) {
    const idx = Math.floor(Math.random() * choices.length);

    return choices[idx];
  }

  function randomMessages() {
    const type = getRandomChoice(["build", "lint", "test"]);

    if (type === "lint") {
      return getRandomChoice([
        [
          "command:lint:state:started",
          "command:lint:stdout:lint passed\n\n",
          "command:lint:state:exited with 0",
        ],
        [
          "command:lint:state:started",
          "command:lint:stdout:/tmp/web/dashflow_demo.js\n",
          "command:lint:stdout:5:7   error  'socket' is not defined  no-undef\n",
          "command:lint:stdout:7:7   error  'socket' is not defined  no-undef\n\n",
          "command:lint:stdout:✖ 2 problems (2 errors, 0 warnings)\n\n",
          "command:lint:stdout:error Command failed with exit code 1.\n\n",
          "command:lint:state:exited with 1",
        ],
      ]);
    } else if (type === "test") {
      return getRandomChoice([
        [
          "command:test:state:started",
          "command:test:stdout:formatter\n",
          "command:test:stdout:  ✓ format shell\n",
          "command:test:stdout:  ✓ unformat shell\n",
          "command:test:stdout:  ✓ format watch\n",
          "command:test:stdout:  ✓ unformat watch\n",
          "command:test:stdout:  ✓ format restart\n",
          "command:test:stdout:  ✓ unformat restart\n",
          "command:test:stdout:  ✓ format command\n",
          "command:test:stdout:  ✓ unformat command\n",
          "command:test:stdout:  ✓ smart unformat\n\n",
          "command:test:stdout:10 passing (9ms)\n\n",
          "command:test:state:exited with 0",
        ],
        [
          "command:test:state:started",
          "command:test:stdout:formatter\n",
          "command:test:stdout:  ✓ format shell\n",
          "command:test:stdout:  ✓ unformat shell\n",
          "command:test:stdout:  ✓ format watch\n",
          "command:test:stdout:  ✓ unformat watch\n",
          "command:test:stdout:  ✓ format restart\n",
          "command:test:stdout:  ✓ unformat restart\n",
          "command:test:stdout:  ✓ format command\n",
          "command:test:stdout:  ✓ unformat command\n",
          "command:test:stdout:  ✖ smart unformat\n\n",
          "command:test:stdout:9 passing, 1 failed (19ms)\n\n",
          "command:test:state:exited with 1",
          "command:test:state:started",
        ],
      ]);
    } else {
      return getRandomChoice([
        ["command:build:state:started"],
        [
          "command:build:stdout:build passed\n\n",
          "command:build:state:exited with 0",
        ],
        [
          "command:build:stdout:build failed\n\n",
          "command:build:state:exited with 1",
        ],
      ]);
    }
  }

  function humanize(message) {
    if (message.indexOf(":state:") !== -1) {
      return "";
    } else {
      return message.substring(message.lastIndexOf(":stdout:") + 8);
    }
  }

  function generateRandonEvents() {
    const messages = randomMessages();

    return messages.map(function(message) {
      return {
        id: globalEventId++,
        t: Date.now(),
        e: message,
        h: humanize(message),
      };
    });
  }

  connectToDemo(window.appStore);
})();
